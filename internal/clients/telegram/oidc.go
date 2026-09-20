package telegram

import (
	"context"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.redsock.ru/toolbox"

	"go.zpotify.ru/zpotify/internal/utils"
)

type TgClaims struct {
	// Standard JWT claims
	jwt.RegisteredClaims

	Id    int64  `json:"-"`
	Login string `json:"-"`

	// OIDC standard claims
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Locale        string `json:"locale"`

	// Username is Telegram's public @handle claim. It is empty for accounts
	// that have not set a public username.
	Username string `json:"username"`
}

// telegramID unmarshals the "id" claim, which Telegram encodes inconsistently
// as either a JSON number or a JSON string.
type telegramID int64

func (t *telegramID) UnmarshalJSON(data []byte) error {
	var asInt int64
	err := json.Unmarshal(data, &asInt)
	if err == nil {
		*t = telegramID(asInt)
		return nil
	}

	var asString string
	err = json.Unmarshal(data, &asString)
	if err != nil {
		return fmt.Errorf("telegram id claim is neither a number nor a string: %w", err)
	}

	parsed, err := strconv.ParseInt(asString, 10, 64)
	if err != nil {
		return fmt.Errorf("failed to parse telegram id claim %q: %w", asString, err)
	}

	*t = telegramID(parsed)
	return nil
}

// UnmarshalJSON is defined explicitly so the "id" claim can be decoded via telegramID
// while every other field keeps the default struct-tag-driven unmarshaling.
func (c *TgClaims) UnmarshalJSON(data []byte) error {
	type alias TgClaims
	aux := struct {
		Id telegramID `json:"id"`
		*alias
	}{
		alias: (*alias)(c),
	}

	err := json.Unmarshal(data, &aux)
	if err != nil {
		return fmt.Errorf("failed to unmarshal telegram claims: %w", err)
	}

	c.Id = int64(aux.Id)
	return nil
}

// JWKSResponse represents the JSON Web Key Set response.
type JWKSResponse struct {
	Keys []JWK `json:"keys"`
}

// JWK represents a JSON Web Key.
type JWK struct {
	Kid string   `json:"kid"`
	Kty string   `json:"kty"`
	Alg string   `json:"alg"`
	Use string   `json:"use"`
	N   string   `json:"n"` // Modulus for RSA
	E   string   `json:"e"` // Exponent for RSA
	X5c []string `json:"x5c,omitempty"`
}

// TokenParser handles ID token parsing and verification.
type TokenParser struct {
	jwksURL     string
	issuer      string
	audience    string
	httpClient  *http.Client
	jwksCache   *JWKSResponse
	cacheExpiry time.Time
}

// NewTokenParser creates a new token parser with configuration. httpClient may be nil,
// in which case http.DefaultClient is used - pass a proxy-configured client when the
// JWKS host is unreachable directly (same as the Telegram bot's outbound calls).
func NewTokenParser(jwksURL, issuer, audience string, httpClient *http.Client) TokenParser {
	if httpClient == nil {
		httpClient = http.DefaultClient
	}
	return TokenParser{
		jwksURL:    jwksURL,
		issuer:     issuer,
		audience:   audience,
		httpClient: httpClient,
	}
}

func (tp *TokenParser) ParseAndVerifyIdToken(idToken string) (TgClaims, error) {
	token, err := jwt.ParseWithClaims(idToken, &TgClaims{}, tp.keyFunc)
	if err != nil {
		return TgClaims{}, fmt.Errorf("failed to parse token: %w", err)
	}
	if !token.Valid {
		return TgClaims{}, fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(*TgClaims)
	if !ok {
		return TgClaims{}, fmt.Errorf("failed to extract claims")
	}

	if tp.issuer != "" && claims.Issuer != tp.issuer {
		return TgClaims{}, fmt.Errorf("invalid issuer: expected %s, got %s", tp.issuer, claims.Issuer)
	}

	if tp.audience != "" && claims.Audience != nil {
		audienceFound := false
		for _, aud := range claims.Audience {
			if aud == tp.audience {
				audienceFound = true
				break
			}
		}
		if !audienceFound {
			return TgClaims{}, fmt.Errorf("invalid audience: expected %s", tp.audience)
		}
	}

	claims.Login = toolbox.Coalesce(claims.Name, claims.GivenName)

	if claims.Id == 0 {
		return *claims, fmt.Errorf("missing telegram id in claims")
	}

	return *claims, nil
}

// keyFunc provides the public key for token verification.
func (tp *TokenParser) keyFunc(token *jwt.Token) (interface{}, error) {
	// Verify signing algorithm
	if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
		return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
	}

	// Get kid from header
	kid, ok := token.Header["kid"].(string)
	if !ok {
		return nil, fmt.Errorf("kid header not found")
	}

	// Fetch JWKS
	jwks, err := tp.getJWKS()
	if err != nil {
		return nil, fmt.Errorf("failed to get JWKS: %w", err)
	}

	// Find matching key
	var jwk *JWK
	for _, key := range jwks.Keys {
		if key.Kid == kid {
			jwk = &key
			break
		}
	}

	if jwk == nil {
		return nil, fmt.Errorf("no key found for kid: %s", kid)
	}

	// Convert JWK to RSA public key
	return tp.jwkToRSAKey(jwk)
}

// getJWKS fetches and caches JWKS from the provider.
func (tp *TokenParser) getJWKS() (*JWKSResponse, error) {
	// Return cached JWKS if still valid (cache for 24 hours)
	if tp.jwksCache != nil && time.Now().Before(tp.cacheExpiry) {
		return tp.jwksCache, nil
	}

	// Fetch JWKS
	req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, tp.jwksURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to build JWKS request: %w", err)
	}

	resp, err := tp.httpClient.Do(req) //nolint:bodyclose // closed below via utils.CloseWithLog
	if err != nil {
		return nil, fmt.Errorf("failed to fetch JWKS: %w", err)
	}
	defer utils.CloseWithLog(resp.Body, "telegram JWKS response body")

	var jwks JWKSResponse
	err = json.NewDecoder(resp.Body).Decode(&jwks)
	if err != nil {
		return nil, fmt.Errorf("failed to decode JWKS: %w", err)
	}

	// Cache for 24 hours
	tp.jwksCache = &jwks
	tp.cacheExpiry = time.Now().Add(24 * time.Hour)

	return &jwks, nil
}

// jwkToRSAKey converts a JWK to an RSA public key.
func (tp *TokenParser) jwkToRSAKey(jwk *JWK) (*rsa.PublicKey, error) {
	// Decode modulus (n) and exponent (e) from base64
	nBytes, err := base64.RawURLEncoding.DecodeString(jwk.N)
	if err != nil {
		return nil, fmt.Errorf("failed to decode modulus: %w", err)
	}

	eBytes, err := base64.RawURLEncoding.DecodeString(jwk.E)
	if err != nil {
		return nil, fmt.Errorf("failed to decode exponent: %w", err)
	}

	// Convert bytes to integers
	n := new(big.Int).SetBytes(nBytes)
	e := int(new(big.Int).SetBytes(eBytes).Int64())

	// Create RSA public key
	publicKey := &rsa.PublicKey{
		N: n,
		E: e,
	}

	return publicKey, nil
}

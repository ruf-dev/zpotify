package telegram

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// UserData represents the extracted user information from ID token
type UserData struct {
	UserID        string `json:"user_id"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Locale        string `json:"locale"`
	Issuer        string `json:"iss"`
	Audience      string `json:"aud"`
	ExpiresAt     int64  `json:"exp"`
	IssuedAt      int64  `json:"iat"`
}

// CustomClaims defines the structure of your ID token claims
type CustomClaims struct {
	// Standard JWT claims
	jwt.RegisteredClaims

	// OIDC standard claims
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Locale        string `json:"locale"`

	// Custom claims from your provider
	UserID string `json:"user_id"` // Or "sub" for subject
}

// JWKSResponse represents the JSON Web Key Set response
type JWKSResponse struct {
	Keys []JWK `json:"keys"`
}

// JWK represents a JSON Web Key
type JWK struct {
	Kid string   `json:"kid"`
	Kty string   `json:"kty"`
	Alg string   `json:"alg"`
	Use string   `json:"use"`
	N   string   `json:"n"` // Modulus for RSA
	E   string   `json:"e"` // Exponent for RSA
	X5c []string `json:"x5c,omitempty"`
}

// TokenParser handles ID token parsing and verification
type TokenParser struct {
	jwksURL     string
	issuer      string
	audience    string
	jwksCache   *JWKSResponse
	cacheExpiry time.Time
}

// NewTokenParser creates a new token parser with configuration
func NewTokenParser(jwksURL, issuer, audience string) TokenParser {
	return TokenParser{
		jwksURL:  jwksURL,
		issuer:   issuer,
		audience: audience,
	}
}

func (tp *TokenParser) ParseAndVerifyIdToken(idToken string) (*UserData, error) {
	// Parse and verify the token
	token, err := jwt.ParseWithClaims(idToken, &CustomClaims{}, tp.keyFunc)
	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	// Validate the token
	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	// Extract claims
	claims, ok := token.Claims.(*CustomClaims)
	if !ok {
		return nil, fmt.Errorf("failed to extract claims")
	}

	// Validate issuer (optional but recommended)
	if tp.issuer != "" && claims.Issuer != tp.issuer {
		return nil, fmt.Errorf("invalid issuer: expected %s, got %s", tp.issuer, claims.Issuer)
	}

	// Validate audience (optional but recommended)
	if tp.audience != "" && claims.Audience != nil {
		audienceFound := false
		for _, aud := range claims.Audience {
			if aud == tp.audience {
				audienceFound = true
				break
			}
		}
		if !audienceFound {
			return nil, fmt.Errorf("invalid audience: expected %s", tp.audience)
		}
	}

	// Extract user data
	userData := &UserData{
		UserID:        claims.UserID,
		Email:         claims.Email,
		EmailVerified: claims.EmailVerified,
		Name:          claims.Name,
		GivenName:     claims.GivenName,
		FamilyName:    claims.FamilyName,
		Picture:       claims.Picture,
		Locale:        claims.Locale,
		Issuer:        claims.Issuer,
		ExpiresAt:     claims.ExpiresAt.Time.Unix(),
		IssuedAt:      claims.IssuedAt.Time.Unix(),
	}

	// Fallback to 'sub' claim if user_id is not present
	if userData.UserID == "" && claims.Subject != "" {
		userData.UserID = claims.Subject
	}

	return userData, nil
}

// keyFunc provides the public key for token verification
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

// getJWKS fetches and caches JWKS from the provider
func (tp *TokenParser) getJWKS() (*JWKSResponse, error) {
	// Return cached JWKS if still valid (cache for 24 hours)
	if tp.jwksCache != nil && time.Now().Before(tp.cacheExpiry) {
		return tp.jwksCache, nil
	}

	// Fetch JWKS
	resp, err := http.Get(tp.jwksURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch JWKS: %w", err)
	}
	defer resp.Body.Close()

	var jwks JWKSResponse
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return nil, fmt.Errorf("failed to decode JWKS: %w", err)
	}

	// Cache for 24 hours
	tp.jwksCache = &jwks
	tp.cacheExpiry = time.Now().Add(24 * time.Hour)

	return &jwks, nil
}

// jwkToRSAKey converts a JWK to an RSA public key
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

func ParseIDTokenSimple(idToken, secretKey string) (*UserData, error) {
	token, err := jwt.ParseWithClaims(idToken, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*CustomClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return &UserData{
		UserID:    claims.UserID,
		Email:     claims.Email,
		Name:      claims.Name,
		Issuer:    claims.Issuer,
		ExpiresAt: claims.ExpiresAt.Time.Unix(),
	}, nil
}

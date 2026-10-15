package v1

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/service/service_errors"
)

const (
	oauthStateTtl                = 10 * time.Minute
	oauthStatePayloadSeparator   = "|"
	oauthStateSignatureSeparator = "."
)

func signOauthState(secretsKey string, storageUuid uuid.UUID, now time.Time) string {
	expiry := now.Add(oauthStateTtl).Unix()
	payload := storageUuid.String() + oauthStatePayloadSeparator + strconv.FormatInt(expiry, 10)

	encodedPayload := base64.RawURLEncoding.EncodeToString([]byte(payload))
	signature := base64.RawURLEncoding.EncodeToString(oauthStateMac(secretsKey, []byte(payload)))

	return encodedPayload + oauthStateSignatureSeparator + signature
}

func verifyOauthState(secretsKey string, state string, now time.Time) (uuid.UUID, error) {
	encodedPayload, encodedSignature, ok := strings.Cut(state, oauthStateSignatureSeparator)
	if !ok {
		return uuid.Nil, rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	payload, err := base64.RawURLEncoding.DecodeString(encodedPayload)
	if err != nil {
		return uuid.Nil, rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	signature, err := base64.RawURLEncoding.DecodeString(encodedSignature)
	if err != nil {
		return uuid.Nil, rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	isSignatureValid := hmac.Equal(signature, oauthStateMac(secretsKey, payload))
	if !isSignatureValid {
		return uuid.Nil, rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	rawUuid, rawExpiry, ok := strings.Cut(string(payload), oauthStatePayloadSeparator)
	if !ok {
		return uuid.Nil, rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	expiry, err := strconv.ParseInt(rawExpiry, 10, 64)
	if err != nil {
		return uuid.Nil, rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	if now.Unix() > expiry {
		return uuid.Nil, rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	storageUuid, err := uuid.Parse(rawUuid)
	if err != nil {
		return uuid.Nil, rerrors.Wrap(service_errors.ErrUnauthorized)
	}

	return storageUuid, nil
}

func oauthStateMac(secretsKey string, payload []byte) []byte {
	macKey := sha256.Sum256([]byte(secretsKey))

	mac := hmac.New(sha256.New, macKey[:])
	mac.Write(payload)

	return mac.Sum(nil)
}

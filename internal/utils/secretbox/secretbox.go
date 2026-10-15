package secretbox

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"io"

	"go.redsock.ru/rerrors"
)

func Encrypt(key string, plain []byte) ([]byte, error) {
	gcm, err := newGcm(key)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	nonce := make([]byte, gcm.NonceSize())
	_, err = io.ReadFull(rand.Reader, nonce)
	if err != nil {
		return nil, rerrors.Wrap(err, "error generating nonce")
	}

	return gcm.Seal(nonce, nonce, plain, nil), nil
}

func Decrypt(key string, blob []byte) ([]byte, error) {
	gcm, err := newGcm(key)
	if err != nil {
		return nil, rerrors.Wrap(err)
	}

	nonceSize := gcm.NonceSize()
	if len(blob) < nonceSize+gcm.Overhead() {
		return nil, rerrors.Wrap(ErrCorrupted)
	}

	plain, err := gcm.Open(nil, blob[:nonceSize], blob[nonceSize:], nil)
	if err != nil {
		return nil, rerrors.Wrap(ErrCorrupted)
	}

	return plain, nil
}

func newGcm(key string) (cipher.AEAD, error) {
	if key == "" {
		return nil, rerrors.Wrap(ErrKeyMissing)
	}

	sum := sha256.Sum256([]byte(key))

	block, err := aes.NewCipher(sum[:])
	if err != nil {
		return nil, rerrors.Wrap(err, "error creating cipher")
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, rerrors.Wrap(err, "error creating gcm")
	}

	return gcm, nil
}

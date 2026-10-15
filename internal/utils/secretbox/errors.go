package secretbox

import "go.redsock.ru/rerrors"

var (
	ErrKeyMissing = rerrors.New("secrets key is not configured")

	ErrCorrupted = rerrors.New("encrypted blob is corrupted")
)

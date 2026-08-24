package utils

import (
	"strings"

	"go.redsock.ru/rerrors"
)

// ErrInvalidFolderName is returned by SanitizeFolderName when the candidate
// folder name is not a safe single path segment.
var ErrInvalidFolderName = rerrors.New("invalid folder name")

// maxFolderNameBytes is the maximum length, in bytes, of a sanitized folder
// name accepted by SanitizeFolderName.
const maxFolderNameBytes = 255

// SanitizeFolderName validates that name is safe to use as a single,
// untrusted path segment (e.g. a client-supplied folder name for an
// upload), never a multi-segment path.
//
// The caller is responsible for treating an empty/absent folder value as
// "no folder" and skipping the call to this function entirely — an empty
// string after trimming whitespace is rejected here as invalid, not treated
// as "no folder".
func SanitizeFolderName(name string) (string, error) {
	trimmed := strings.TrimSpace(name)

	if trimmed == "" {
		return "", rerrors.Wrap(ErrInvalidFolderName, "folder name is empty")
	}

	if trimmed == "." || trimmed == ".." {
		return "", rerrors.Wrap(ErrInvalidFolderName, "folder name must not be . or ..")
	}

	if strings.ContainsAny(trimmed, "/\\") {
		return "", rerrors.Wrap(ErrInvalidFolderName, "folder name must not contain path separators")
	}

	if len(trimmed) > maxFolderNameBytes {
		return "", rerrors.Wrap(ErrInvalidFolderName, "folder name is too long")
	}

	for _, b := range []byte(trimmed) {
		if b == 0 {
			return "", rerrors.Wrap(ErrInvalidFolderName, "folder name must not contain a NUL byte")
		}
		if b < 0x20 || b == 0x7f {
			return "", rerrors.Wrap(ErrInvalidFolderName, "folder name must not contain control characters")
		}
	}

	return trimmed, nil
}

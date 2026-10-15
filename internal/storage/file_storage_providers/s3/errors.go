package s3

import "go.redsock.ru/rerrors"

var (
	ErrEndpointRequired = rerrors.New("s3 endpoint is required")
	ErrBucketRequired   = rerrors.New("s3 bucket is required")
	ErrProbeMismatch    = rerrors.New("s3 probe content mismatch")
)

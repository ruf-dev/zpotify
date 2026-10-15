package tests

import "os"

const (
	S3Region    = "us-east-1"
	S3AccessKey = "GKae2e0ae2e0ae2e0ae2e0ae2e"
	S3SecretKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

	defaultS3Endpoint = "localhost:19100"
	s3EndpointEnv     = "S3_ENDPOINT"
)

// S3Endpoint is the host:port of the Garage container from docker-compose.yaml (test-garage),
// overridable with the S3_ENDPOINT environment variable.
var S3Endpoint = resolveS3Endpoint()

func resolveS3Endpoint() string {
	endpoint := os.Getenv(s3EndpointEnv)
	if endpoint == "" {
		return defaultS3Endpoint
	}

	return endpoint
}

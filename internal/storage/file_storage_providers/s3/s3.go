package s3

import (
	"bytes"
	"context"
	"io"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/storage"
	"go.zpotify.ru/zpotify/internal/utils"
)

const (
	presignExpiry = time.Hour
	unknownSize   = -1
)

type Storage struct {
	client *minio.Client
	bucket string
}

func New(_ context.Context, cfg domain.S3Config) (storage.ContentStorage, error) {
	if cfg.Bucket == "" {
		return nil, rerrors.Wrap(ErrBucketRequired)
	}

	host, isSecure := splitEndpoint(cfg.Endpoint)
	if host == "" {
		return nil, rerrors.Wrap(ErrEndpointRequired)
	}

	bucketLookup := minio.BucketLookupDNS
	if cfg.IsPathStyle {
		bucketLookup = minio.BucketLookupPath
	}

	opts := &minio.Options{
		Creds:        credentials.NewStaticV4(cfg.AccessKeyId, cfg.SecretAccessKey, ""),
		Secure:       isSecure,
		Region:       cfg.Region,
		BucketLookup: bucketLookup,
	}

	client, err := minio.New(host, opts)
	if err != nil {
		return nil, rerrors.Wrap(err, "error creating s3 client")
	}

	return &Storage{client: client, bucket: cfg.Bucket}, nil
}

func (s *Storage) Put(ctx context.Context, path string, content io.Reader) error {
	opts := minio.PutObjectOptions{}

	_, err := s.client.PutObject(ctx, s.bucket, path, content, unknownSize, opts)
	if err != nil {
		return rerrors.Wrap(err, "error putting object")
	}

	return nil
}

func (s *Storage) Get(ctx context.Context, path string) (io.ReadCloser, error) {
	opts := minio.GetObjectOptions{}

	object, err := s.client.GetObject(ctx, s.bucket, path, opts)
	if err != nil {
		return nil, rerrors.Wrap(err, "error getting object")
	}

	_, err = object.Stat()
	if err != nil {
		utils.CloseWithLog(object, "s3 object")
		return nil, rerrors.Wrap(err, "error stating object")
	}

	return object, nil
}

func (s *Storage) Copy(ctx context.Context, fromPath, toPath string) error {
	src := minio.CopySrcOptions{Bucket: s.bucket, Object: fromPath}
	dst := minio.CopyDestOptions{Bucket: s.bucket, Object: toPath}

	_, err := s.client.CopyObject(ctx, dst, src)
	if err != nil {
		return rerrors.Wrap(err, "error copying object")
	}

	return nil
}

func (s *Storage) Delete(ctx context.Context, path string) error {
	opts := minio.RemoveObjectOptions{}

	err := s.client.RemoveObject(ctx, s.bucket, path, opts)
	if err != nil {
		return rerrors.Wrap(err, "error removing object")
	}

	return nil
}

func (s *Storage) Resolve(ctx context.Context, path string) (domain.RemoteTarget, error) {
	params := url.Values{}

	presigned, err := s.client.PresignedGetObject(ctx, s.bucket, path, presignExpiry, params)
	if err != nil {
		return domain.RemoteTarget{}, rerrors.Wrap(err, "error presigning object")
	}

	target := domain.RemoteTarget{Url: presigned.String()}

	return target, nil
}

func (s *Storage) Probe(ctx context.Context) error {
	path := ".probe-" + uuid.NewString()
	payload := []byte(path)

	err := s.Put(ctx, path, bytes.NewReader(payload))
	if err != nil {
		return rerrors.Wrap(err, "error putting probe")
	}

	defer func() {
		_ = s.Delete(ctx, path)
	}()

	reader, err := s.Get(ctx, path)
	if err != nil {
		return rerrors.Wrap(err, "error getting probe")
	}
	defer utils.CloseWithLog(reader, "s3 probe")

	got, err := io.ReadAll(reader)
	if err != nil {
		return rerrors.Wrap(err, "error reading probe")
	}

	if !bytes.Equal(got, payload) {
		return rerrors.Wrap(ErrProbeMismatch)
	}

	err = s.Delete(ctx, path)
	if err != nil {
		return rerrors.Wrap(err, "error deleting probe")
	}

	return nil
}

func splitEndpoint(endpoint string) (host string, isSecure bool) {
	endpoint = strings.TrimSpace(endpoint)
	isSecure = true

	if rest, ok := strings.CutPrefix(endpoint, "http://"); ok {
		endpoint = rest
		isSecure = false
	} else if rest, ok := strings.CutPrefix(endpoint, "https://"); ok {
		endpoint = rest
	}

	return strings.TrimRight(endpoint, "/"), isSecure
}

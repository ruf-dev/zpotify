package domain

import "github.com/google/uuid"

type StorageKind string

const (
	StorageKindLocal       StorageKind = "local"
	StorageKindS3          StorageKind = "s3"
	StorageKindWebdav      StorageKind = "webdav"
	StorageKindGoogleDrive StorageKind = "google_drive"
)

var LocalStorageUuid = uuid.MustParse("00000000-0000-0000-0000-000000000001")

type S3Config struct {
	Endpoint        string
	Region          string
	Bucket          string
	AccessKeyId     string
	SecretAccessKey string
	IsPathStyle     bool
}

type WebdavConfig struct {
	Url      string
	Username string
	Password string
	RootPath string
}

type GoogleDriveConfig struct {
	ClientId     string
	ClientSecret string
	RootFolderId string
	RefreshToken string
}

// StorageConfig holds exactly one non-nil config for a non-local storage.
type StorageConfig struct {
	S3          *S3Config
	Webdav      *WebdavConfig
	GoogleDrive *GoogleDriveConfig
}

type Storage struct {
	Uuid        uuid.UUID
	Name        string
	Kind        StorageKind
	Config      StorageConfig
	IsDefault   bool
	OwnerUserId *int64
	QuotaBytes  *int64
}

type StorageInfo struct {
	Uuid        uuid.UUID
	Name        string
	Kind        StorageKind
	IsDefault   bool
	IsConnected bool
	UsedBytes   int64
	QuotaBytes  *int64
	Config      StorageConfig
}

type CreateStorage struct {
	Name   string
	Config StorageConfig
}

// UpdateStorage empty secret fields keep the stored value.
type UpdateStorage struct {
	Uuid   uuid.UUID
	Name   string
	Config StorageConfig
}

type RemoteTarget struct {
	Url                 string
	AuthorizationHeader string
}

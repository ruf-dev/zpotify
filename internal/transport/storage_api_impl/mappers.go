package storage_api_impl

import (
	"go.zpotify.ru/zpotify/internal/api/server/zpotify_api"
	"go.zpotify.ru/zpotify/internal/domain"
)

func toDomainStorageConfig(config *zpotify_api.StorageConfig) domain.StorageConfig {
	out := domain.StorageConfig{}

	s3 := config.GetS3()
	if s3 != nil {
		out.S3 = &domain.S3Config{
			Endpoint:        s3.GetEndpoint(),
			Region:          s3.GetRegion(),
			Bucket:          s3.GetBucket(),
			AccessKeyId:     s3.GetAccessKeyId(),
			SecretAccessKey: s3.GetSecretAccessKey(),
			IsPathStyle:     s3.GetIsPathStyle(),
		}
	}

	webdav := config.GetWebdav()
	if webdav != nil {
		out.Webdav = &domain.WebdavConfig{
			Url:      webdav.GetUrl(),
			Username: webdav.GetUsername(),
			Password: webdav.GetPassword(),
			RootPath: webdav.GetRootPath(),
		}
	}

	googleDrive := config.GetGoogleDrive()
	if googleDrive != nil {
		out.GoogleDrive = &domain.GoogleDriveConfig{
			ClientId:     googleDrive.GetClientId(),
			ClientSecret: googleDrive.GetClientSecret(),
			RootFolderId: googleDrive.GetRootFolderId(),
		}
	}

	return out
}

func toProtoStorageInfo(info domain.StorageInfo) *zpotify_api.StorageInfo {
	return &zpotify_api.StorageInfo{
		Id:          info.Uuid.String(),
		Name:        info.Name,
		Kind:        toProtoStorageKind(info.Kind),
		IsDefault:   info.IsDefault,
		IsConnected: info.IsConnected,
		UsedBytes:   info.UsedBytes,
		QuotaBytes:  info.QuotaBytes,
	}
}

func toProtoStorageKind(kind domain.StorageKind) zpotify_api.StorageKind {
	switch kind {
	case domain.StorageKindLocal:
		return zpotify_api.StorageKind_STORAGE_KIND_LOCAL
	case domain.StorageKindS3:
		return zpotify_api.StorageKind_STORAGE_KIND_S3
	case domain.StorageKindWebdav:
		return zpotify_api.StorageKind_STORAGE_KIND_WEBDAV
	case domain.StorageKindGoogleDrive:
		return zpotify_api.StorageKind_STORAGE_KIND_GOOGLE_DRIVE
	default:
		return zpotify_api.StorageKind_STORAGE_KIND_UNSPECIFIED
	}
}

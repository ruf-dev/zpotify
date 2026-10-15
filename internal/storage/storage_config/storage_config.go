package storage_config

import (
	"encoding/json"

	"go.redsock.ru/rerrors"

	"go.zpotify.ru/zpotify/internal/domain"
	"go.zpotify.ru/zpotify/internal/utils/secretbox"
)

type s3Json struct {
	Endpoint        string `json:"endpoint"`
	Region          string `json:"region"`
	Bucket          string `json:"bucket"`
	AccessKeyId     string `json:"access_key_id"`
	SecretAccessKey string `json:"secret_access_key"`
	IsPathStyle     bool   `json:"is_path_style"`
}

type webdavJson struct {
	Url      string `json:"url"`
	Username string `json:"username"`
	Password string `json:"password"`
	RootPath string `json:"root_path"`
}

type googleDriveJson struct {
	ClientId     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
	RootFolderId string `json:"root_folder_id"`
	RefreshToken string `json:"refresh_token"`
}

type configJson struct {
	S3          *s3Json          `json:"s3,omitempty"`
	Webdav      *webdavJson      `json:"webdav,omitempty"`
	GoogleDrive *googleDriveJson `json:"google_drive,omitempty"`
}

func Encode(key string, cfg domain.StorageConfig) ([]byte, error) {
	mirror := toJson(cfg)

	plain, err := json.Marshal(mirror)
	if err != nil {
		return nil, rerrors.Wrap(err, "error marshalling storage config")
	}

	blob, err := secretbox.Encrypt(key, plain)
	if err != nil {
		return nil, rerrors.Wrap(err, "error encrypting storage config")
	}

	return blob, nil
}

func Decode(key string, blob []byte) (domain.StorageConfig, error) {
	if len(blob) == 0 {
		return domain.StorageConfig{}, nil
	}

	plain, err := secretbox.Decrypt(key, blob)
	if err != nil {
		return domain.StorageConfig{}, rerrors.Wrap(err, "error decrypting storage config")
	}

	var mirror configJson
	err = json.Unmarshal(plain, &mirror)
	if err != nil {
		return domain.StorageConfig{}, rerrors.Wrap(err, "error unmarshalling storage config")
	}

	return fromJson(mirror), nil
}

func toJson(cfg domain.StorageConfig) configJson {
	var out configJson

	if cfg.S3 != nil {
		out.S3 = &s3Json{
			Endpoint:        cfg.S3.Endpoint,
			Region:          cfg.S3.Region,
			Bucket:          cfg.S3.Bucket,
			AccessKeyId:     cfg.S3.AccessKeyId,
			SecretAccessKey: cfg.S3.SecretAccessKey,
			IsPathStyle:     cfg.S3.IsPathStyle,
		}
	}

	if cfg.Webdav != nil {
		out.Webdav = &webdavJson{
			Url:      cfg.Webdav.Url,
			Username: cfg.Webdav.Username,
			Password: cfg.Webdav.Password,
			RootPath: cfg.Webdav.RootPath,
		}
	}

	if cfg.GoogleDrive != nil {
		out.GoogleDrive = &googleDriveJson{
			ClientId:     cfg.GoogleDrive.ClientId,
			ClientSecret: cfg.GoogleDrive.ClientSecret,
			RootFolderId: cfg.GoogleDrive.RootFolderId,
			RefreshToken: cfg.GoogleDrive.RefreshToken,
		}
	}

	return out
}

func fromJson(in configJson) domain.StorageConfig {
	var out domain.StorageConfig

	if in.S3 != nil {
		out.S3 = &domain.S3Config{
			Endpoint:        in.S3.Endpoint,
			Region:          in.S3.Region,
			Bucket:          in.S3.Bucket,
			AccessKeyId:     in.S3.AccessKeyId,
			SecretAccessKey: in.S3.SecretAccessKey,
			IsPathStyle:     in.S3.IsPathStyle,
		}
	}

	if in.Webdav != nil {
		out.Webdav = &domain.WebdavConfig{
			Url:      in.Webdav.Url,
			Username: in.Webdav.Username,
			Password: in.Webdav.Password,
			RootPath: in.Webdav.RootPath,
		}
	}

	if in.GoogleDrive != nil {
		out.GoogleDrive = &domain.GoogleDriveConfig{
			ClientId:     in.GoogleDrive.ClientId,
			ClientSecret: in.GoogleDrive.ClientSecret,
			RootFolderId: in.GoogleDrive.RootFolderId,
			RefreshToken: in.GoogleDrive.RefreshToken,
		}
	}

	return out
}

/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";

type Absent<T, K extends keyof T> = { [k in Exclude<keyof T, K>]?: undefined };

type OneOf<T> =
  | { [k in keyof T]?: undefined }
  | (keyof T extends infer K
      ? K extends string & keyof T
        ? { [k in K]: T[K] } & Absent<T, K>
        : never
      : never);

export enum StorageKind {
  STORAGE_KIND_UNSPECIFIED = "STORAGE_KIND_UNSPECIFIED",
  STORAGE_KIND_LOCAL = "STORAGE_KIND_LOCAL",
  STORAGE_KIND_S3 = "STORAGE_KIND_S3",
  STORAGE_KIND_WEBDAV = "STORAGE_KIND_WEBDAV",
  STORAGE_KIND_GOOGLE_DRIVE = "STORAGE_KIND_GOOGLE_DRIVE",
}

export type StorageInfo = {
  id?: string;
  name?: string;
  kind?: StorageKind;
  isDefault?: boolean;
  isConnected?: boolean;
  usedBytes?: string;
  quotaBytes?: string;
  config?: StorageConfig;
};

export type S3Config = {
  endpoint?: string;
  region?: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  isPathStyle?: boolean;
};

export type WebdavConfig = {
  url?: string;
  username?: string;
  password?: string;
  rootPath?: string;
};

export type GoogleDriveConfig = {
  clientId?: string;
  clientSecret?: string;
  rootFolderId?: string;
};

type BaseStorageConfig = {
};

export type StorageConfig = BaseStorageConfig &
  OneOf<{
    s3: S3Config;
    webdav: WebdavConfig;
    googleDrive: GoogleDriveConfig;
  }>;

export type ListStoragesRequest = Record<string, never>;

export type ListStoragesResponse = {
  storages?: StorageInfo[];
  isSecretsKeyConfigured?: boolean;
};

export type ListStorages = Record<string, never>;

export type CreateStorageRequest = {
  name?: string;
  config?: StorageConfig;
};

export type CreateStorageResponse = {
  storage?: StorageInfo;
};

export type CreateStorage = Record<string, never>;

export type UpdateStorageRequest = {
  id?: string;
  name?: string;
  config?: StorageConfig;
};

export type UpdateStorageResponse = Record<string, never>;

export type UpdateStorage = Record<string, never>;

export type DeleteStorageRequest = {
  id?: string;
};

export type DeleteStorageResponse = Record<string, never>;

export type DeleteStorage = Record<string, never>;

export type SetDefaultStorageRequest = {
  id?: string;
};

export type SetDefaultStorageResponse = Record<string, never>;

export type SetDefaultStorage = Record<string, never>;

export type TestStorageRequest = {
  id?: string;
};

export type TestStorageResponse = Record<string, never>;

export type TestStorage = Record<string, never>;

export type StartGoogleDriveAuthRequest = {
  id?: string;
};

export type StartGoogleDriveAuthResponse = {
  consentUrl?: string;
};

export type StartGoogleDriveAuth = Record<string, never>;

export class StorageAPI {
  static ListStorages(this:void, req: ListStoragesRequest, initReq?: fm.InitReq): Promise<ListStoragesResponse> {
    return fm.fetchRequest<ListStoragesResponse>(`/api/admin/storage/list`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static CreateStorage(this:void, req: CreateStorageRequest, initReq?: fm.InitReq): Promise<CreateStorageResponse> {
    return fm.fetchRequest<CreateStorageResponse>(`/api/admin/storage/create`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static UpdateStorage(this:void, req: UpdateStorageRequest, initReq?: fm.InitReq): Promise<UpdateStorageResponse> {
    return fm.fetchRequest<UpdateStorageResponse>(`/api/admin/storage/update`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static DeleteStorage(this:void, req: DeleteStorageRequest, initReq?: fm.InitReq): Promise<DeleteStorageResponse> {
    return fm.fetchRequest<DeleteStorageResponse>(`/api/admin/storage/delete`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static SetDefaultStorage(this:void, req: SetDefaultStorageRequest, initReq?: fm.InitReq): Promise<SetDefaultStorageResponse> {
    return fm.fetchRequest<SetDefaultStorageResponse>(`/api/admin/storage/set_default`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static TestStorage(this:void, req: TestStorageRequest, initReq?: fm.InitReq): Promise<TestStorageResponse> {
    return fm.fetchRequest<TestStorageResponse>(`/api/admin/storage/test`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static StartGoogleDriveAuth(this:void, req: StartGoogleDriveAuthRequest, initReq?: fm.InitReq): Promise<StartGoogleDriveAuthResponse> {
    return fm.fetchRequest<StartGoogleDriveAuthResponse>(`/api/admin/storage/google_drive/auth`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
}
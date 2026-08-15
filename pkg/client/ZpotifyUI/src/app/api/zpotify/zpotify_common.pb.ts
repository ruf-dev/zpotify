/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

type Absent<T, K extends keyof T> = { [k in Exclude<keyof T, K>]?: undefined };

type OneOf<T> =
  | { [k in keyof T]?: undefined }
  | (keyof T extends infer K
      ? K extends string & keyof T
        ? { [k in K]: T[K] } & Absent<T, K>
        : never
      : never);

export enum SongTagKind {
  SONG_TAG_KIND_UNSPECIFIED = "SONG_TAG_KIND_UNSPECIFIED",
  SONG_TAG_KIND_SINGLE = "SONG_TAG_KIND_SINGLE",
}

export enum AlbumTagKind {
  ALBUM_TAG_KIND_UNSPECIFIED = "ALBUM_TAG_KIND_UNSPECIFIED",
  ALBUM_TAG_KIND_GENRE = "ALBUM_TAG_KIND_GENRE",
  ALBUM_TAG_KIND_MOOD = "ALBUM_TAG_KIND_MOOD",
  ALBUM_TAG_KIND_ERA = "ALBUM_TAG_KIND_ERA",
  ALBUM_TAG_KIND_VIBE = "ALBUM_TAG_KIND_VIBE",
  ALBUM_TAG_KIND_LANGUAGE = "ALBUM_TAG_KIND_LANGUAGE",
  ALBUM_TAG_KIND_THEME = "ALBUM_TAG_KIND_THEME",
  ALBUM_TAG_KIND_HIT = "ALBUM_TAG_KIND_HIT",
  ALBUM_TAG_KIND_ALBUM_VERSION = "ALBUM_TAG_KIND_ALBUM_VERSION",
}

export enum AlbumVersionMetadataVersionKind {
  VERSION_KIND_UNSPECIFIED = "VERSION_KIND_UNSPECIFIED",
  VERSION_KIND_DELUXE = "VERSION_KIND_DELUXE",
  VERSION_KIND_EXTENDED = "VERSION_KIND_EXTENDED",
  VERSION_KIND_REMASTER = "VERSION_KIND_REMASTER",
  VERSION_KIND_ANNIVERSARY = "VERSION_KIND_ANNIVERSARY",
  VERSION_KIND_LIVE = "VERSION_KIND_LIVE",
}

export type Paging = {
  limit?: string;
  offset?: string;
};

export type ArtistBase = {
  uuid?: string;
  name?: string;
  liked?: boolean;
  avatarFilePath?: string;
};

export type SongTag = {
  kind?: SongTagKind;
  value?: string;
};

export type SongBase = {
  id?: string;
  title?: string;
  artists?: ArtistBase[];
  durationSec?: number;
  filePath?: string;
  fileId?: string;
  tags?: SongTag[];
  coverFilePath?: string;
};

export type AlbumVersionMetadata = {
  versionKind?: AlbumVersionMetadataVersionKind;
  parentPlaylistUuid?: string;
};

type BaseAlbumTag = {
  kind?: AlbumTagKind;
  value?: string;
};

export type AlbumTag = BaseAlbumTag &
  OneOf<{
    albumVersion: AlbumVersionMetadata;
  }>;

export type Playlist = {
  uuid?: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
  artists?: ArtistBase[];
  songCount?: number;
  coverFilePath?: string;
  year?: number;
  tags?: AlbumTag[];
  canEdit?: boolean;
  isSaved?: boolean;
  ownerUsername?: string;
};

export type SongFile = {
  id?: string;
  path?: string;
};
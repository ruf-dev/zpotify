/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */


export type Paging = {
  limit?: string;
  offset?: string;
};

export type ArtistBase = {
  uuid?: string;
  name?: string;
};

export type SongBase = {
  id?: string;
  title?: string;
  artists?: ArtistBase[];
  durationSec?: number;
  filePath?: string;
};

export type Playlist = {
  uuid?: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
};

export type SongFile = {
  id?: string;
  path?: string;
};
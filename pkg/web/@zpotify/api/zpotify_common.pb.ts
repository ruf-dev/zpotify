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
  name?: string;
};

export type SongBase = {
  uniqueId?: string;
  title?: string;
  artists?: ArtistBase[];
  durationSec?: number;
};

export type Playlist = {
  uuid?: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
};
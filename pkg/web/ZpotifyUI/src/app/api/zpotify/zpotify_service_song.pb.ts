/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";


export type CreateSongRequest = {
  title?: string;
  artistUuids?: string[];
  fileId?: string;
};

export type CreateSongResponse = {
  id?: string;
};

export type CreateSong = Record<string, never>;

export type UpdateSongRequest = {
  id?: string;
  title?: string;
  artistUuids?: string[];
};

export type UpdateSongResponse = Record<string, never>;

export type UpdateSong = Record<string, never>;

export class SongAPI {
  static CreateSong(this:void, req: CreateSongRequest, initReq?: fm.InitReq): Promise<CreateSongResponse> {
    return fm.fetchRequest<CreateSongResponse>(`/api/song/create`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static UpdateSong(this:void, req: UpdateSongRequest, initReq?: fm.InitReq): Promise<UpdateSongResponse> {
    return fm.fetchRequest<UpdateSongResponse>(`/api/song/update`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
}
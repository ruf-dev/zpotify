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

export class SongAPI {
  static CreateSong(this:void, req: CreateSongRequest, initReq?: fm.InitReq): Promise<CreateSongResponse> {
    return fm.fetchRequest<CreateSongResponse>(`/api/song/create`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
}
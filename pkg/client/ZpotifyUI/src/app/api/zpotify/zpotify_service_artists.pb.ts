/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";
import * as ZpotifyApiZpotifyCommon from "./zpotify_common.pb";


export type ListArtistRequest = {
  paging?: ZpotifyApiZpotifyCommon.Paging;
  filters?: ListArtistFilters;
};

export type ListArtistResponse = {
  artists?: ZpotifyApiZpotifyCommon.ArtistBase[];
};

export type ListArtistFilters = {
  search?: string;
  onlyLiked?: boolean;
};

export type ListArtist = Record<string, never>;

export type CreateArtistRequest = {
  name?: string;
};

export type CreateArtistResponse = {
  artist?: ZpotifyApiZpotifyCommon.ArtistBase;
};

export type CreateArtist = Record<string, never>;

export type LikeArtistRequest = {
  artistUuid?: string;
};

export type LikeArtistResponse = Record<string, never>;

export type LikeArtist = Record<string, never>;

export type UnlikeArtistRequest = {
  artistUuid?: string;
};

export type UnlikeArtistResponse = Record<string, never>;

export type UnlikeArtist = Record<string, never>;

export type Artist = {
  uuid?: string;
  name?: string;
  liked?: boolean;
  avatarFilePath?: string;
  backgroundCoverFilePath?: string;
  canEdit?: boolean;
};

export type GetArtistPageRequest = {
  artistUuid?: string;
};

export type GetArtistPageResponse = {
  artist?: Artist;
  albums?: ZpotifyApiZpotifyCommon.Playlist[];
  singles?: ZpotifyApiZpotifyCommon.SongBase[];
  features?: ZpotifyApiZpotifyCommon.SongBase[];
};

export type GetArtistPage = Record<string, never>;

export type UpdateArtistRequest = {
  uuid?: string;
  name?: string;
  avatarFileId?: string;
  backgroundCoverFileId?: string;
};

export type UpdateArtistResponse = {
  avatarFilePath?: string;
  backgroundCoverFilePath?: string;
};

export type UpdateArtist = Record<string, never>;

export class ArtistsAPI {
  static ListArtist(this:void, req: ListArtistRequest, initReq?: fm.InitReq): Promise<ListArtistResponse> {
    return fm.fetchRequest<ListArtistResponse>(`/api/artists/list`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static CreateArtist(this:void, req: CreateArtistRequest, initReq?: fm.InitReq): Promise<CreateArtistResponse> {
    return fm.fetchRequest<CreateArtistResponse>(`/api/artists/create`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static LikeArtist(this:void, req: LikeArtistRequest, initReq?: fm.InitReq): Promise<LikeArtistResponse> {
    return fm.fetchRequest<LikeArtistResponse>(`/api/artists/like`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static UnlikeArtist(this:void, req: UnlikeArtistRequest, initReq?: fm.InitReq): Promise<UnlikeArtistResponse> {
    return fm.fetchRequest<UnlikeArtistResponse>(`/api/artists/unlike`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static GetArtistPage(this:void, req: GetArtistPageRequest, initReq?: fm.InitReq): Promise<GetArtistPageResponse> {
    return fm.fetchRequest<GetArtistPageResponse>(`/api/artists/get_page`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static UpdateArtist(this:void, req: UpdateArtistRequest, initReq?: fm.InitReq): Promise<UpdateArtistResponse> {
    return fm.fetchRequest<UpdateArtistResponse>(`/api/artists/update`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
}
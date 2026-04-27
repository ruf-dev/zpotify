import {RefObject} from "react";

import {
    InitReq,
    SongAPI,
} from "@/app/api/zpotify";

import {AuthMiddleware} from "@/processes/Auth.ts";

import {BaseService} from "@/processes/BaseService.ts";

export interface ISongsService {
    CreateSong: (title: string, artistUuids: string[], fileId: string) => Promise<string>
    UpdateSong: (id: string, title: string, artistUuids: string[]) => Promise<void>
}

export class SongsService extends BaseService implements ISongsService {
    constructor(authMiddleware: RefObject<AuthMiddleware>) {
        super(authMiddleware)
    }

    async CreateSong(title: string, artistUuids: string[], fileId: string): Promise<string> {
        return this.executeAuthApiCall(
            (initReq: InitReq) => {
                return SongAPI
                    .CreateSong({title, artistUuids, fileId}, initReq)
                    .then(resp => resp.id || "")
            }
        )
    }

    async UpdateSong(id: string, title: string, artistUuids: string[]): Promise<void> {
        return this.executeAuthApiCall(
            (initReq: InitReq) => {
                return SongAPI
                    .UpdateSong({id, title, artistUuids}, initReq)
                    .then(() => undefined)
            }
        )
    }
}

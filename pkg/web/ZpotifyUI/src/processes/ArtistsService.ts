import { RefObject } from "react";

import {
    ArtistsAPI,
    Paging,
    ListArtistRequest,
    ListArtistResponse,
} from "@/app/api/zpotify";

import { BaseService } from "@/processes/BaseService.ts";
import { AuthMiddleware } from "@/processes/Auth.ts";

export interface IArtistsService {
    ListArtist(search: string, offset: number, limit: number): Promise<ListArtistResponse>
}

export class ArtistsService extends BaseService implements IArtistsService {
    constructor(auth: RefObject<AuthMiddleware>) {
        super(auth);
    }

    async ListArtist(search: string, offset: number, limit: number): Promise<ListArtistResponse> {
        const req: ListArtistRequest = {
            paging: {
                limit: limit.toString(),
                offset: offset.toString(),
            } as Paging,
            filters: {
                search: search || undefined,
            },
        };

        return this.executeAuthApiCall(async (initReq) => {
            return ArtistsAPI.ListArtist(req, initReq);
        });
    }
}

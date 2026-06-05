import {
    ArtistsAPI,
    Paging,
    ListArtistRequest,
    ListArtistResponse,
} from "@/app/api/zpotify";

import { BaseService } from "@/shared/api/BaseService.ts";
import { AuthMiddleware } from "@/shared/api/Auth.ts";
import type { ArtistItem } from "@/widgets/ArtistField/ArtistChipsField";

export interface IArtistsService {
    ListArtist(search: string, offset: number, limit: number): Promise<ListArtistResponse>
    CreateArtist(name: string): Promise<ArtistItem>
}

export class ArtistsService extends BaseService implements IArtistsService {
    constructor(auth: AuthMiddleware) {
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

    async CreateArtist(name: string): Promise<ArtistItem> {
        const res = await this.executeAuthApiCall(async (initReq) => {
            return ArtistsAPI.CreateArtist({name}, initReq);
        });
        return {id: res.artist!.uuid!, name: res.artist!.name!};
    }
}

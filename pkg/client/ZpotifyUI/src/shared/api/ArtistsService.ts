import {
    ArtistsAPI,
    Paging,
    ListArtistRequest,
    ListArtistResponse,
    GetArtistPageRequest,
    GetArtistPageResponse,
    UpdateArtistRequest,
    UpdateArtistResponse,
} from '@/app/api/zpotify';
import { BaseService } from '@/shared/api/BaseService.ts';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';

export interface IArtistsService {
    ListArtist(search: string, offset: number, limit: number, onlyLiked?: boolean): Promise<ListArtistResponse>;
    CreateArtist(name: string): Promise<ArtistItem>;
    LikeArtist(artistUuid: string): Promise<void>;
    UnlikeArtist(artistUuid: string): Promise<void>;
    GetArtistPage(uuid: string): Promise<GetArtistPageResponse>;
    UpdateArtist(
        uuid: string,
        name?: string,
        avatarFileId?: string,
        backgroundCoverFileId?: string,
    ): Promise<UpdateArtistResponse>;
}

export class ArtistsService extends BaseService implements IArtistsService {
    async ListArtist(search: string, offset: number, limit: number, onlyLiked?: boolean): Promise<ListArtistResponse> {
        const req: ListArtistRequest = {
            paging: {
                limit: limit.toString(),
                offset: offset.toString(),
            } as Paging,
            filters: {
                search: search || undefined,
                onlyLiked: onlyLiked || undefined,
            },
        };

        return this.executeAuthApiCall(async (initReq) => {
            return ArtistsAPI.ListArtist(req, initReq);
        });
    }

    async CreateArtist(name: string): Promise<ArtistItem> {
        const res = await this.executeAuthApiCall(async (initReq) => {
            return ArtistsAPI.CreateArtist({ name }, initReq);
        });
        return { id: res.artist!.uuid!, name: res.artist!.name! };
    }

    async LikeArtist(artistUuid: string): Promise<void> {
        await this.executeAuthApiCall(async (initReq) => {
            return ArtistsAPI.LikeArtist({ artistUuid }, initReq);
        });
    }

    async UnlikeArtist(artistUuid: string): Promise<void> {
        await this.executeAuthApiCall(async (initReq) => {
            return ArtistsAPI.UnlikeArtist({ artistUuid }, initReq);
        });
    }

    async GetArtistPage(uuid: string): Promise<GetArtistPageResponse> {
        const req = { artistUuid: uuid } as GetArtistPageRequest;
        return this.executeAuthApiCall(async (initReq) => {
            return ArtistsAPI.GetArtistPage(req, initReq);
        });
    }

    async UpdateArtist(
        uuid: string,
        name?: string,
        avatarFileId?: string,
        backgroundCoverFileId?: string,
    ): Promise<UpdateArtistResponse> {
        const req: UpdateArtistRequest = { uuid, name, avatarFileId, backgroundCoverFileId };
        return this.executeAuthApiCall(async (initReq) => {
            return ArtistsAPI.UpdateArtist(req, initReq);
        });
    }
}

export const artistsService = new ArtistsService();

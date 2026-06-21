import { InitReq, SongAPI, SongBase } from '@/app/api/zpotify';
import { BaseService } from '@/shared/api/BaseService.ts';

export interface ISongsService {
    CreateSong: (title: string, artistUuids: string[], fileId: string) => Promise<string>;
    BatchCreateSong: (songs: Array<{ title: string; artistUuids: string[]; fileId: string }>) => Promise<string[]>;
    UpdateSong: (id: string, title: string, artistUuids: string[]) => Promise<void>;
    GetSong: (id: string) => Promise<SongBase>;
}

export class SongsService extends BaseService implements ISongsService {
    async CreateSong(title: string, artistUuids: string[], fileId: string): Promise<string> {
        return this.executeAuthApiCall((initReq: InitReq) => {
            return SongAPI.CreateSong({ title, artistUuids, fileId }, initReq).then((resp) => resp.id || '');
        });
    }

    async BatchCreateSong(songs: Array<{ title: string; artistUuids: string[]; fileId: string }>): Promise<string[]> {
        return this.executeAuthApiCall((initReq: InitReq) => {
            return SongAPI.BatchCreateSong({ songs }, initReq).then((resp) => resp.ids ?? []);
        });
    }

    async UpdateSong(id: string, title: string, artistUuids: string[]): Promise<void> {
        return this.executeAuthApiCall((initReq: InitReq) => {
            return SongAPI.UpdateSong({ id, title, artistUuids }, initReq).then(() => undefined);
        });
    }

    async GetSong(id: string): Promise<SongBase> {
        return this.executeAuthApiCall((initReq: InitReq) => {
            return SongAPI.GetSong({ id }, initReq).then((resp) => resp.song!);
        });
    }
}

export const songsService = new SongsService();

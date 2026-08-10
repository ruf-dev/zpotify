import { HomeAPI, GetFeedRequest, GetFeedResponse, Paging } from '@/app/api/zpotify';
import { BaseService } from '@/shared/api/BaseService.ts';
import { buildCoverUrl } from '@/shared/lib/coverUrl.ts';
import { toAlbumItem, toPlaylistItem, uuidToSeed } from '@/shared/api/PlaylistService.ts';
import type { FeedDay, FeedSongItem, FeedArtistItem } from '@/widgets/FeedHomeSegment/model.ts';

type WireFeedDay = NonNullable<GetFeedResponse['days']>[number];
type WireSongBase = NonNullable<WireFeedDay['songsAdded']>[number];
type WireArtistBase = NonNullable<WireFeedDay['artistsAdded']>[number];

export interface IFeedService {
    GetFeed(limit: number, offset: number): Promise<{ days: FeedDay[]; totalDays: number }>;
}

export class FeedService extends BaseService implements IFeedService {
    async GetFeed(limit: number, offset: number): Promise<{ days: FeedDay[]; totalDays: number }> {
        const req: GetFeedRequest = {
            paging: { limit: limit.toString(), offset: offset.toString() } as Paging,
        };

        return this.executeAuthApiCall((initReq) => HomeAPI.GetFeed(req, initReq)).then(toFeedResult);
    }
}

function toFeedResult(resp: GetFeedResponse): { days: FeedDay[]; totalDays: number } {
    return {
        days: (resp.days ?? []).map(toFeedDay),
        totalDays: resp.totalDays ?? 0,
    };
}

function toFeedDay(day: WireFeedDay): FeedDay {
    return {
        date: String(day.date ?? ''),
        playlistsAdded: (day.playlistsAdded ?? []).map((p) =>
            (p.artists?.length ?? 0) > 0 ? toAlbumItem(p) : toPlaylistItem(p, []),
        ),
        songsAdded: (day.songsAdded ?? []).map(toFeedSongItem),
        artistsAdded: (day.artistsAdded ?? []).map(toFeedArtistItem),
    };
}

function toFeedSongItem(s: WireSongBase): FeedSongItem {
    return {
        id: s.id ?? '',
        title: s.title ?? '',
        artists: (s.artists ?? []).filter((a) => a.name).map((a) => ({ uuid: a.uuid, name: a.name ?? '' })),
        coverUrl: buildCoverUrl(s.coverFilePath),
        durationSec: s.durationSec ?? 0,
        filePath: s.filePath,
    };
}

function toFeedArtistItem(a: WireArtistBase): FeedArtistItem {
    const uuid = a.uuid ?? '';
    return {
        uuid,
        name: a.name ?? '',
        seed: uuidToSeed(uuid),
    };
}

export const feedService = new FeedService();

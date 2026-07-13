import { ConfirmDialog } from '@vervstack/chures';

import type { Playlist, SongBase } from '@/app/api/zpotify';
import { isAlbum } from '@/entities/playlist/isAlbum.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import { cacheTracks, getTrackUrl } from '@/shared/lib/audioCache.ts';
import { useAudioCacheStore, useCachedCount, useDownloadProgress } from '@/shared/model/audioCacheStore.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { useDialog } from '@/app/hooks/Dialog.tsx';

const DOWNLOAD_ALL_FETCH_LIMIT = 100000;

export interface UseDownloadButtonWidgetParams {
    playlist: Playlist;
    songs: SongBase[];
}

export function useDownloadButtonWidget({ playlist, songs }: UseDownloadButtonWidgetParams) {
    const toaster = useToaster();
    const { OpenDialog, CloseDialog } = useDialog();
    const downloadProgress = useDownloadProgress(playlist.uuid);
    const { cached: cachedCount, total: cachedTotal } = useCachedCount(songs);

    async function handleDownloadPlaylist() {
        if (!playlist.uuid || downloadProgress) return;
        const uuid = playlist.uuid;

        try {
            const resp = await playlistService.ListSongs(uuid, 0, DOWNLOAD_ALL_FETCH_LIMIT, undefined);
            const songsByUrl = new Map(
                (resp.songs ?? [])
                    .filter((s): s is SongBase & { filePath: string } => !!s.filePath)
                    .map((s) => [getTrackUrl(s.filePath), s] as const),
            );
            const urls = Array.from(songsByUrl.keys());

            if (urls.length === 0) return;

            useAudioCacheStore.getState().setDownloadProgress(uuid, 0, urls.length);
            const { succeeded, failed } = await cacheTracks(urls, (completed, total) =>
                useAudioCacheStore.getState().setDownloadProgress(uuid, completed, total),
            );
            succeeded.forEach((url) => {
                const song = songsByUrl.get(url);
                const meta = song
                    ? {
                          title: song.title || 'Track',
                          artist: song.artists?.[0]?.name ?? 'Unknown',
                          songId: song.id,
                          playlistName: playlist.name,
                          playlistUuid: playlist.uuid,
                          isAlbum: isAlbum(playlist),
                      }
                    : undefined;
                useAudioCacheStore.getState().addCachedUrl(url, meta);
            });

            if (failed.length === 0) {
                toaster.bake({
                    title: isAlbum(playlist) ? 'Album downloaded' : 'Playlist downloaded',
                    description: `${playlist.name || 'All tracks'} are now available offline`,
                    level: 'Info',
                });
            } else {
                toaster.bake({
                    title: 'Download incomplete',
                    description: `${failed.length} of ${urls.length} tracks could not be downloaded`,
                    level: 'Error',
                });
            }
        } catch (e) {
            toaster.catch(e as never);
        } finally {
            useAudioCacheStore.getState().clearDownloadProgress(uuid);
        }
    }

    function handleUnloadCache() {
        const playlistName = playlist.name || 'this';

        async function handleConfirm() {
            const urls = songs
                .map((s) => s.filePath)
                .filter((p): p is string => !!p)
                .map(getTrackUrl);
            await useAudioCacheStore.getState().removeCachedUrls(urls);
            toaster.bake({
                title: 'Cache cleared',
                description: `${playlistName} is no longer available offline`,
                level: 'Info',
            });
            CloseDialog();
        }

        OpenDialog(
            <ConfirmDialog
                title="Unload cache"
                message={`Would you like to unload cache for ${playlistName} playlist?`}
                confirmLabel="Unload"
                danger
                onConfirm={handleConfirm}
                onClose={CloseDialog}
            />,
        );
    }

    const allCached = cachedTotal > 0 && cachedCount === cachedTotal;
    const downloadFillPercent = downloadProgress
        ? (downloadProgress.completed / downloadProgress.total) * 100
        : cachedTotal > 0
          ? (cachedCount / cachedTotal) * 100
          : 0;
    const downloadButtonStyle = { '--progress': `${downloadFillPercent}%` } as React.CSSProperties;

    return {
        allCached,
        downloadDisabled: !!downloadProgress,
        downloadButtonStyle,
        onDownloadClick: allCached ? handleUnloadCache : handleDownloadPlaylist,
    };
}

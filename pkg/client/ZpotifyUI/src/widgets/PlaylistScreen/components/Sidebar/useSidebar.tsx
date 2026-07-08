import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmDialog } from '@vervstack/chures';

import type { Playlist, SongBase } from '@/app/api/zpotify';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import { isAlbum } from '@/entities/playlist/isAlbum.ts';
import { artistsService } from '@/shared/api/ArtistsService.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import { webApiService } from '@/shared/api/WebApi.ts';
import { buildCoverUrl } from '@/shared/lib/coverUrl.ts';
import { cacheTracks, getTrackUrl } from '@/shared/lib/audioCache.ts';
import { useAudioCacheStore, useCachedCount, useDownloadProgress } from '@/shared/model/audioCacheStore.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { useDialog } from '@/app/hooks/Dialog.tsx';

const DOWNLOAD_ALL_FETCH_LIMIT = 100000;

function resolveCoverSeed(playlist: Playlist): number {
    const fileId = playlist.coverFilePath ?? '';
    const match = fileId.match(/^generative:(\d+)$/);
    if (match) {
        return parseInt(match[1], 10);
    }
    const uuid = playlist.uuid ?? '0';
    return (uuid.charCodeAt(0) % 7) + 1;
}

export interface UseSidebarParams {
    playlist: Playlist | null;
    songs: SongBase[];
    editMode: boolean;
    onExitEditMode: () => void;
}

export function useSidebar({ playlist, songs, editMode, onExitEditMode }: UseSidebarParams) {
    const seed = playlist ? resolveCoverSeed(playlist) : 1;
    const coverUrl = buildCoverUrl(playlist?.coverFilePath);
    const artistName = playlist?.artists?.[0]?.name ?? 'Unknown Artist';
    const [aboutExpanded, setAboutExpanded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [coverHover, setCoverHover] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const toaster = useToaster();
    const { OpenDialog, CloseDialog } = useDialog();
    const downloadProgress = useDownloadProgress(playlist?.uuid);
    const { cached: cachedCount, total: cachedTotal } = useCachedCount(songs);

    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editYear, setEditYear] = useState<number | undefined>();
    const [editArtists, setEditArtists] = useState<ArtistItem[]>([]);
    const [editCover, setEditCover] = useState<File | undefined>();
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | undefined>();

    useEffect(() => {
        if (!editMode || !playlist) return;
        setEditName(playlist.name ?? '');
        setEditDesc(playlist.description ?? '');
        setEditYear(playlist.year ?? undefined);
        setEditArtists(
            (playlist.artists ?? []).filter((a) => a.uuid && a.name).map((a) => ({ id: a.uuid!, name: a.name! })),
        );
        setEditCover(undefined);
        setCoverPreviewUrl(undefined);
    }, [editMode]);

    const loadArtistOptions = useCallback(
        (query: string): Promise<ArtistItem[]> =>
            artistsService
                .ListArtist(query, 0, 8)
                .then((res) =>
                    (res.artists ?? []).filter((a) => a.name && a.uuid).map((a) => ({ id: a.uuid!, name: a.name! })),
                ),
        [],
    );

    const handleCreateArtist = useCallback(async function handleCreateArtist(_name: string): Promise<ArtistItem> {
        alert('TODO: create artist');
        throw new Error('not implemented');
    }, []);

    async function handleSave() {
        if (saving || !playlist) return;
        setSaving(true);
        try {
            let coverFileId: string | undefined;
            if (editCover) {
                coverFileId = await webApiService.UploadFile(editCover);
            }
            const artistUuids = editArtists.map((a) => a.id);
            const response = await playlistService.UpdatePlaylist(
                playlist.uuid ?? '',
                editName.trim(),
                editDesc.trim(),
                artistUuids,
                coverFileId,
                editYear,
                [],
            );
            if (response.coverFilePath) {
                queryClient.setQueryData(['playlist', playlist.uuid], (old: Playlist | null | undefined) =>
                    old ? { ...old, coverFilePath: response.coverFilePath } : old,
                );
            }
            setEditCover(undefined);
            setCoverPreviewUrl(undefined);
            await queryClient.invalidateQueries({ queryKey: ['playlist', playlist.uuid] });
            onExitEditMode();
        } catch (e) {
            toaster.catch(e as never);
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        onExitEditMode();
    }

    function handleToggleAbout() {
        setAboutExpanded((prev) => !prev);
    }

    function handleCoverMouseEnter() {
        setCoverHover(true);
    }

    function handleCoverMouseLeave() {
        setCoverHover(false);
    }

    function handleCoverClick() {
        if (!editMode) return;
        coverInputRef.current?.click();
    }

    function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setEditCover(file);
        setCoverPreviewUrl(URL.createObjectURL(file));
    }

    async function handleDownloadPlaylist() {
        if (!playlist || !playlist.uuid || downloadProgress) return;
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
                    ? { title: song.title || 'Track', artist: song.artists?.[0]?.name ?? 'Unknown', songId: song.id }
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
        if (!playlist) return;
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

    const playlistIsAlbum = playlist ? isAlbum(playlist) : false;
    const displayCoverUrl = coverPreviewUrl ?? coverUrl;

    const allCached = cachedTotal > 0 && cachedCount === cachedTotal;
    const downloadFillPercent = downloadProgress
        ? (downloadProgress.completed / downloadProgress.total) * 100
        : cachedTotal > 0
          ? (cachedCount / cachedTotal) * 100
          : 0;
    const downloadButtonStyle = { '--progress': `${downloadFillPercent}%` } as React.CSSProperties;

    return {
        seed,
        artistName,
        playlistIsAlbum,
        displayCoverUrl,

        aboutExpanded,
        handleToggleAbout,

        saving,
        coverHover,
        coverInputRef,
        handleCoverMouseEnter,
        handleCoverMouseLeave,
        handleCoverClick,
        handleCoverFileChange,

        editName,
        setEditName,
        editDesc,
        setEditDesc,
        editYear,
        setEditYear,
        editArtists,
        setEditArtists,
        loadArtistOptions,
        handleCreateArtist,

        handleSave,
        handleCancel,

        downloadProgress,
        allCached,
        downloadButtonStyle,
        handleDownloadPlaylist,
        handleUnloadCache,
    };
}

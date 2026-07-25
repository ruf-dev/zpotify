import { useState } from 'react';

import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { songsService } from '@/shared/api/Songs.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import { useFeedRefresh } from '@/entities/feed/useFeedRefresh.ts';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import type { ChipEntry } from '@/widgets/ChipsField/ChipsField';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';

interface ToCreateTrack {
    idx: number;
    draft: { title: string; artistUuids: string[]; fileId: string };
}

export interface MultitrackSubmitParams {
    tracks: TrackDraft[];
    playlistMode: boolean;
    playlistName: string;
    albumArtists: ArtistItem[];
    year: number | undefined;
    tags: ChipEntry[];
    hasCover: boolean;
    resolveCoverFileId: () => Promise<string | undefined>;
    targetPlaylistUuid?: string;
    CloseDialog: () => void;
    LockClosing: () => void;
    UnlockClosing: () => void;
    refreshActive: () => void;
    refreshPlaylists: () => void;
}

export interface MultitrackSubmitState {
    submitting: boolean;
    handleSubmit: () => void;
}

function collectTracksToCreate(tracks: TrackDraft[], albumArtists: ArtistItem[]): ToCreateTrack[] {
    const toCreate: ToCreateTrack[] = [];
    tracks.forEach((track, idx) => {
        if (track.linkedSongId) return;
        const seen = new Set<string>();
        const artistUuids = [...albumArtists, ...track.artists]
            .filter((a) => !seen.has(a.id) && seen.add(a.id))
            .map((a) => a.id);
        toCreate.push({
            idx,
            draft: { title: track.title || track.file?.name || '', artistUuids, fileId: track.fileId! },
        });
    });
    return toCreate;
}

function resolveSongIds(tracks: TrackDraft[], toCreate: ToCreateTrack[], createdIds: string[]): string[] {
    return tracks.map((track, i) => {
        if (track.linkedSongId) return track.linkedSongId;
        const pos = toCreate.findIndex((t) => t.idx === i);
        return createdIds[pos];
    });
}

export function useMultitrackSubmit(params: MultitrackSubmitParams): MultitrackSubmitState {
    const toaster = useToaster();
    const bumpFeed = useFeedRefresh((s) => s.bump);
    const [submitting, setSubmitting] = useState(false);

    function createPlaylistWithSongs(songIds: string[]): Promise<void> {
        const coverFileIdPromise = params.hasCover
            ? params.resolveCoverFileId()
            : Promise.resolve<string | undefined>(undefined);

        return coverFileIdPromise.then((coverFileId) => {
            const albumArtistUuids = params.albumArtists.map((a) => a.id);
            return playlistService
                .CreatePlaylist(
                    params.playlistName.trim(),
                    albumArtistUuids.length > 0 ? albumArtistUuids : undefined,
                    coverFileId,
                    params.year,
                    params.tags.length > 0 ? params.tags : undefined,
                )
                .then((playlist) => {
                    const playlistUuid = playlist.uuid ?? '';
                    return playlistService.AddSongsToPlaylist(
                        playlistUuid,
                        songIds.map((id) => parseInt(id, 10)),
                    );
                })
                .then(() => undefined);
        });
    }

    function addSongsToTargetPlaylist(targetPlaylistUuid: string, songIds: string[]): Promise<void> {
        return playlistService.AddSongsToPlaylist(
            targetPlaylistUuid,
            songIds.map((id) => parseInt(id, 10)),
        );
    }

    function handleSubmit() {
        if (submitting || params.tracks.length === 0) return;
        if (!params.targetPlaylistUuid && params.playlistMode && !params.playlistName.trim()) return;

        setSubmitting(true);
        params.LockClosing();

        const toCreate = collectTracksToCreate(params.tracks, params.albumArtists);
        const createSongs =
            toCreate.length > 0
                ? songsService.BatchCreateSong(toCreate.map((t) => t.draft))
                : Promise.resolve<string[]>([]);

        createSongs
            .then((createdIds) => {
                const songIds = resolveSongIds(params.tracks, toCreate, createdIds);
                if (params.targetPlaylistUuid) return addSongsToTargetPlaylist(params.targetPlaylistUuid, songIds);
                return params.playlistMode ? createPlaylistWithSongs(songIds) : undefined;
            })
            .then(() => {
                setTimeout(() => {
                    params.UnlockClosing();
                    params.CloseDialog();
                    params.refreshActive();
                    if (!params.targetPlaylistUuid && params.playlistMode) params.refreshPlaylists();
                    bumpFeed();
                }, 800);
            })
            .catch((e) => {
                setSubmitting(false);
                params.UnlockClosing();
                toaster.catch(e as never);
            });
    }

    return { submitting, handleSubmit };
}

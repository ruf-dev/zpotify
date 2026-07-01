import { useCallback, useEffect, useRef, useState } from 'react';
import { parseBlob } from 'music-metadata-browser';
import cn from 'classnames';

import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { webApiService } from '@/shared/api/WebApi.ts';
import { artistsService } from '@/shared/api/ArtistsService.ts';
import { songsService } from '@/shared/api/Songs.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import { fileService } from '@/shared/api/FileService.ts';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import type { ChipEntry } from '@/widgets/ChipsField/ChipsField';
import { useSongListRefresh } from '@/entities/song/useSongListRefresh.ts';
import { usePlaylistListRefresh } from '@/entities/playlist/usePlaylistListRefresh.ts';
import type { SongBase } from '@/app/api/zpotify';
import ChevronRightIcon from '@/assets/icons/ChevronRightIcon.tsx';

import TrackList from '@/dialogs/MultitrackUpload/TrackList';
import PlaylistDetailsPanel from '@/dialogs/MultitrackUpload/PlaylistDetailsPanel';
import PlaylistToggleRow from '@/dialogs/MultitrackUpload/PlaylistToggleRow';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';
import { cleanTitle, formatTotalSize, computeHash } from '@/dialogs/MultitrackUpload/utils';

import cls from '@/dialogs/MultitrackUpload/MultitrackUploadModal.module.css';

interface MultitrackUploadModalProps {
    files: File[];
}

// Upload strictly one file at a time so a batch does not saturate the uplink
// and starve every other request (audio, API, artwork). Tune here if needed.
const MAX_CONCURRENT_UPLOADS = 3;

export default function MultitrackUploadModal({ files }: MultitrackUploadModalProps) {
    const { CloseDialog, LockClosing, UnlockClosing } = useDialog();
    const toaster = useToaster();
    const refreshActive = useSongListRefresh((s) => s.refreshActive);
    const refreshPlaylists = usePlaylistListRefresh((s) => s.refresh);

    const [tracks, setTracks] = useState<TrackDraft[]>(() =>
        files.map((f) => ({
            id: crypto.randomUUID(),
            file: f,
            title: cleanTitle(f.name),
            artists: [] as ArtistItem[],
            duration: 0,
            size: f.size,
            uploadStatus: 'pending' as const,
            uploadProgress: 0,
        })),
    );
    const [playlistMode, setPlaylistMode] = useState(true);
    const [playlistName, setPlaylistName] = useState('');
    const [albumArtists, setAlbumArtists] = useState<ArtistItem[]>([]);
    const [year, setYear] = useState<number | undefined>();
    const [chips, setChips] = useState<ChipEntry[]>([]);
    const [cover, setCover] = useState<File | undefined>();
    const [submitting, setSubmitting] = useState(false);

    const tracksRef = useRef(tracks);
    tracksRef.current = tracks;

    // hash → trackId; used to de-dup files added in the same session
    const knownHashesRef = useRef<Map<string, string>>(new Map());

    // Bounded upload queue: startUpload() enqueues, and at most
    // MAX_CONCURRENT_UPLOADS run at once. Queued tracks stay 'pending'.
    const uploadQueueRef = useRef<TrackDraft[]>([]);
    const activeUploadsRef = useRef(0);

    function pumpUploadQueue() {
        while (activeUploadsRef.current < MAX_CONCURRENT_UPLOADS && uploadQueueRef.current.length > 0) {
            const next = uploadQueueRef.current.shift()!;
            activeUploadsRef.current += 1;
            runUpload(next);
        }
    }

    function runUpload(t: TrackDraft) {
        setTracks((prev) => prev.map((p) => (p.id === t.id ? { ...p, uploadStatus: 'uploading' } : p)));
        webApiService
            .UploadFileWithProgress(t.file, (pct) => {
                setTracks((prev) => prev.map((p) => (p.id === t.id ? { ...p, uploadProgress: pct } : p)));
            })
            .then((fileId) => {
                setTracks((prev) =>
                    prev.map((p) =>
                        p.id === t.id ? { ...p, fileId, uploadProgress: 100, uploadStatus: 'done' } : p,
                    ),
                );
            })
            .catch(() => {
                setTracks((prev) => prev.map((p) => (p.id === t.id ? { ...p, uploadStatus: 'error' } : p)));
            })
            .finally(() => {
                activeUploadsRef.current -= 1;
                pumpUploadQueue();
            });
    }

    function startUpload(t: TrackDraft) {
        uploadQueueRef.current.push(t);
        pumpUploadQueue();
    }

    useEffect(() => {
        async function processInitialTracks() {
            const initial = tracksRef.current;
            const [hashes, metas] = await Promise.all([
                Promise.all(initial.map((t) => computeHash(t.file))),
                Promise.allSettled(initial.map((t) => parseBlob(t.file))),
            ]);

            hashes.forEach((h, i) => knownHashesRef.current.set(h, initial[i].id));

            const existingMap = await fileService.checkByHashes(hashes);

            const songMetaMap = new Map<string, SongBase>();
            await Promise.all(
                hashes
                    .filter((h) => existingMap.get(h)?.songId)
                    .map(async (h) => {
                        const song = await songsService.GetSong(existingMap.get(h)!.songId!);
                        songMetaMap.set(h, song);
                    }),
            );

            setTracks((prev) =>
                prev.map((p, i) => {
                    const dur =
                        metas[i].status === 'fulfilled' ? (metas[i].value.format.duration ?? 0) : 0;
                    const existing = existingMap.get(hashes[i]);
                    const song = songMetaMap.get(hashes[i]);
                    if (existing) {
                        return {
                            ...p,
                            duration: dur,
                            fileId: existing.fileId,
                            uploadStatus: 'done' as const,
                            uploadProgress: 100,
                            isExisting: true,
                            linkedSongId: existing.songId,
                            ...(song && {
                                title: song.title ?? p.title,
                                artists: (song.artists ?? [])
                                    .filter((a) => a.uuid && a.name)
                                    .map((a) => ({ id: a.uuid!, name: a.name! })),
                            }),
                        };
                    }
                    return { ...p, duration: dur };
                }),
            );

            initial.forEach((t, i) => {
                if (!existingMap.has(hashes[i])) startUpload(t);
            });
        }

        processInitialTracks().catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadArtistOptions = useCallback(
        (query: string): Promise<ArtistItem[]> =>
            artistsService
                .ListArtist(query, 0, 8)
                .then((res) =>
                    (res.artists ?? []).filter((a) => a.name && a.uuid).map((a) => ({ id: a.uuid!, name: a.name! })),
                ),
        [],
    );

    const handleCreateArtist = useCallback(
        async function handleCreateArtist(name: string): Promise<ArtistItem> {
            return artistsService.CreateArtist(name);
        },
        [],
    );

    function handleTitleChange(id: string, title: string) {
        setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
    }

    function handleArtistsChange(id: string, artists: ArtistItem[]) {
        setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, artists } : t)));
    }

    function handleRemove(id: string) {
        setTracks((prev) => prev.filter((t) => t.id !== id));
    }

    function handleReorder(fromIdx: number, toIdx: number) {
        setTracks((prev) => {
            const next = [...prev];
            const [moved] = next.splice(fromIdx, 1);
            next.splice(toIdx, 0, moved);
            return next;
        });
    }

    async function handleAddFiles(newFiles: File[]) {
        const hashes = await Promise.all(newFiles.map(computeHash));

        const fresh: Array<{ file: File; hash: string }> = [];
        const dupeNames: string[] = [];
        newFiles.forEach(function classifyFile(file, i) {
            if (knownHashesRef.current.has(hashes[i])) {
                dupeNames.push(file.name);
            } else {
                fresh.push({ file, hash: hashes[i] });
            }
        });

        if (dupeNames.length > 0) {
            toaster.bake({
                title: 'duplicate file',
                description: `already added: ${dupeNames.join(', ')}`,
                level: 'Warn',
                isDismissable: true,
            });
        }

        if (fresh.length === 0) return;

        const existingMap = await fileService.checkByHashes(fresh.map((f) => f.hash));

        const songMetaMap = new Map<string, SongBase>();
        await Promise.all(
            fresh
                .filter(({ hash }) => existingMap.get(hash)?.songId)
                .map(async ({ hash }) => {
                    const song = await songsService.GetSong(existingMap.get(hash)!.songId!);
                    songMetaMap.set(hash, song);
                }),
        );

        const newTracks: TrackDraft[] = fresh.map(({ file, hash }) => {
            const existing = existingMap.get(hash);
            const song = songMetaMap.get(hash);
            return {
                id: crypto.randomUUID(),
                file,
                title: song?.title ?? cleanTitle(file.name),
                artists: song
                    ? (song.artists ?? []).filter((a) => a.uuid && a.name).map((a) => ({ id: a.uuid!, name: a.name! }))
                    : ([] as ArtistItem[]),
                duration: song?.durationSec ?? 0,
                size: file.size,
                uploadStatus: existing ? ('done' as const) : ('pending' as const),
                uploadProgress: existing ? 100 : 0,
                fileId: existing?.fileId,
                isExisting: !!existing,
                linkedSongId: existing?.songId,
            };
        });

        fresh.forEach(({ hash }, i) => knownHashesRef.current.set(hash, newTracks[i].id));

        setTracks((prev) => [...prev, ...newTracks]);

        newTracks.forEach(function processAddedTrack(t, i) {
            parseBlob(t.file)
                .then((meta) => {
                    const dur = meta.format.duration ?? 0;
                    setTracks((prev) => prev.map((p) => (p.id === t.id ? { ...p, duration: dur } : p)));
                })
                .catch(() => {});

            if (!existingMap.has(fresh[i].hash)) {
                startUpload(t);
            }
        });
    }

    async function handleSubmit() {
        if (submitting || tracks.length === 0) return;
        if (playlistMode && !playlistName.trim()) return;

        setSubmitting(true);
        LockClosing();

        try {
            type ToCreate = { idx: number; draft: { title: string; artistUuids: string[]; fileId: string } };
            const toCreate: ToCreate[] = [];
            tracks.forEach((track, idx) => {
                if (!track.linkedSongId) {
                    const seen = new Set<string>();
                    const artistUuids = [...albumArtists, ...track.artists]
                        .filter((a) => !seen.has(a.id) && seen.add(a.id))
                        .map((a) => a.id);
                    toCreate.push({ idx, draft: { title: track.title || track.file.name, artistUuids, fileId: track.fileId! } });
                }
            });

            const createdIds = toCreate.length > 0
                ? await songsService.BatchCreateSong(toCreate.map((t) => t.draft))
                : [];

            const songIds = tracks.map((track, i) => {
                if (track.linkedSongId) return track.linkedSongId;
                const pos = toCreate.findIndex((t) => t.idx === i);
                return createdIds[pos];
            });

            if (playlistMode) {
                let coverFileId: string | undefined;
                if (cover) {
                    coverFileId = await webApiService.UploadFile(cover);
                }
                const albumArtistUuids = albumArtists.map((a) => a.id);
                const playlist = await playlistService.CreatePlaylist(
                    playlistName.trim(),
                    albumArtistUuids.length > 0 ? albumArtistUuids : undefined,
                    coverFileId,
                    year,
                    chips.length > 0 ? chips : undefined,
                );
                const playlistUuid = playlist.uuid ?? '';

                await playlistService.AddSongsToPlaylist(
                    playlistUuid,
                    songIds.map((id) => parseInt(id, 10)),
                );
            }

            setTimeout(() => {
                UnlockClosing();
                CloseDialog();
                refreshActive();
                if (playlistMode) refreshPlaylists();
            }, 800);
        } catch (e) {
            setSubmitting(false);
            UnlockClosing();
            toaster.catch(e as never);
        }
    }

    const totalDuration = tracks.reduce((s, t) => s + t.duration, 0);
    const allUploaded = tracks.length > 0 && tracks.every((t) => t.uploadStatus === 'done');
    const hasUploadError = tracks.some((t) => t.uploadStatus === 'error');
    const isUploading =
        !hasUploadError && tracks.some((t) => t.uploadStatus === 'pending' || t.uploadStatus === 'uploading');
    const isValid = tracks.length > 0 && (!playlistMode || playlistName.trim().length > 0) && allUploaded;
    const isAlbum = playlistMode && albumArtists.length > 0;
    const titleText = playlistMode ? (isAlbum ? 'new album' : 'new playlist') : 'upload tracks';
    const submitLabel = playlistMode ? (isAlbum ? 'create album' : 'create playlist') : 'upload tracks';

    return (
        <div className={cls.PanelContainer} role="dialog" aria-modal="true" aria-labelledby="multitrack-title">
            <div className={cls.PanelHeader}>
                <div className={cls.HeaderLeft}>
                    <span id="multitrack-title" className={cls.PanelTitle}>
                        {titleText}
                    </span>
                    <span className={cls.PanelMeta}>
                        {files.length} files · {formatTotalSize(files)}
                    </span>
                </div>
                <button
                    type="button"
                    className={cls.CloseButton}
                    onClick={CloseDialog}
                    disabled={submitting}
                    aria-label="close"
                >
                    <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                    >
                        <line x1="1" y1="1" x2="12" y2="12" />
                        <line x1="12" y1="1" x2="1" y2="12" />
                    </svg>
                </button>
            </div>

            <div className={cls.PanelBody}>
                <PlaylistToggleRow checked={playlistMode} onChange={setPlaylistMode} />

                {playlistMode && (
                    <PlaylistDetailsPanel
                        cover={cover}
                        onCoverChange={setCover}
                        playlistName={playlistName}
                        onNameChange={setPlaylistName}
                        albumArtists={albumArtists}
                        onAlbumArtistsChange={setAlbumArtists}
                        totalDurationSec={totalDuration}
                        trackCount={tracks.length}
                        year={year}
                        onYearChange={setYear}
                        loadArtistOptions={loadArtistOptions}
                        onCreateArtist={handleCreateArtist}
                        chips={chips}
                        onChipsChange={setChips}
                    />
                )}

                <TrackList
                    tracks={tracks}
                    albumArtists={playlistMode ? albumArtists : []}
                    onTitleChange={handleTitleChange}
                    onArtistsChange={handleArtistsChange}
                    onRemove={handleRemove}
                    onReorder={handleReorder}
                    onAddFiles={handleAddFiles}
                    loadArtistOptions={loadArtistOptions}
                    onCreateArtist={handleCreateArtist}
                />
            </div>

            <div className={cls.PanelFooter}>
                <span className={cls.ValidationHint}>
                    {hasUploadError
                        ? 'some files failed to upload'
                        : isUploading
                          ? 'uploading files…'
                          : !isValid && playlistMode && !playlistName.trim() && tracks.length > 0
                            ? 'name the playlist to continue'
                            : tracks.length === 0
                              ? 'add at least one track'
                              : ''}
                </span>
                <button
                    type="button"
                    className={cn(cls.SubmitButton, isValid && !submitting ? cls.SubmitReady : cls.SubmitDisabled)}
                    onClick={handleSubmit}
                    disabled={!isValid || submitting}
                >
                    {submitting ? 'uploading…' : submitLabel}
                    {!submitting && <ChevronRightIcon />}
                </button>
            </div>
        </div>
    );
}

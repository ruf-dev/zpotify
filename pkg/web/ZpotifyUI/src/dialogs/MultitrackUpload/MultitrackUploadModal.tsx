import { useCallback, useEffect, useRef, useState } from 'react';
import { parseBlob } from 'music-metadata-browser';

import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { webApiService } from '@/shared/api/WebApi.ts';
import { artistsService } from '@/shared/api/ArtistsService.ts';
import { songsService } from '@/shared/api/Songs.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import { useSongListRefresh } from '@/entities/song/useSongListRefresh.ts';

import TrackList from './TrackList';
import PlaylistDetailsPanel from './PlaylistDetailsPanel';
import type { TrackDraft } from './TrackRow';

import cls from './MultitrackUploadModal.module.css';

interface MultitrackUploadModalProps {
    files: File[];
}

function cleanTitle(filename: string): string {
    return filename
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .trim();
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTotalSize(files: File[]): string {
    const total = files.reduce((s, f) => s + f.size, 0);
    return formatBytes(total);
}

async function computeHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

function CheckIcon() {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 20 20"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline className={cls.CheckPath} points="4 10 8 14 16 6" />
        </svg>
    );
}

function ChevronIcon() {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="9 6 15 12 9 18" />
        </svg>
    );
}

interface PlaylistToggleRowProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

function PlaylistToggleRow({ checked, onChange }: PlaylistToggleRowProps) {
    return (
        <div className={`${cls.ToggleContainer} ${checked ? cls.ToggleChecked : ''}`}>
            <label className={cls.ToggleLabel} onClick={() => onChange(!checked)}>
                <div className={`${cls.Checkbox} ${checked ? cls.CheckboxChecked : ''}`}>
                    {checked && <CheckIcon />}
                </div>
                <div className={cls.ToggleTextStack}>
                    <span className={cls.ToggleMain}>create playlist from these tracks</span>
                    <span className={cls.ToggleSub}>group them as an album with shared cover, name, and artists</span>
                </div>
            </label>
        </div>
    );
}

export default function MultitrackUploadModal({ files }: MultitrackUploadModalProps) {
    const { CloseDialog, LockClosing, UnlockClosing } = useDialog();
    const toaster = useToaster();
    const refreshActive = useSongListRefresh((s) => s.refreshActive);

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
    const [cover, setCover] = useState<File | undefined>();
    const [submitting, setSubmitting] = useState(false);

    const tracksRef = useRef(tracks);
    tracksRef.current = tracks;
    const hashSetRef = useRef<Set<string>>(new Set());
    const hashedFilesRef = useRef<WeakSet<File>>(new WeakSet());

    useEffect(() => {
        const initialTracks = tracksRef.current;
        initialTracks.forEach(async (t) => {
            try {
                const [meta, hash] = await Promise.all([parseBlob(t.file), computeHash(t.file)]);
                hashSetRef.current.add(hash);
                hashedFilesRef.current.add(t.file);
                const dur = meta.format.duration ?? 0;
                setTracks((prev) => prev.map((p) => (p.id === t.id ? { ...p, duration: dur } : p)));
            } catch {
                // duration stays 0, badge shows "—"
            }
        });
    }, []);

    useEffect(() => {
        const initialTracks = tracksRef.current;
        initialTracks.forEach((t) => {
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
                });
        });
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
        const unhashed = tracksRef.current.filter((t) => !hashedFilesRef.current.has(t.file));
        if (unhashed.length > 0) {
            const pendingHashes = await Promise.all(unhashed.map((t) => computeHash(t.file)));
            unhashed.forEach(function registerHash(t, i) {
                hashSetRef.current.add(pendingHashes[i]);
                hashedFilesRef.current.add(t.file);
            });
        }

        const hashes = await Promise.all(newFiles.map(computeHash));

        const fresh: File[] = [];
        const dupeNames: string[] = [];
        newFiles.forEach(function classifyFile(file, i) {
            if (hashSetRef.current.has(hashes[i])) {
                dupeNames.push(file.name);
            } else {
                fresh.push(file);
                hashSetRef.current.add(hashes[i]);
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

        const newTracks: TrackDraft[] = fresh.map((f) => ({
            id: crypto.randomUUID(),
            file: f,
            title: cleanTitle(f.name),
            artists: [] as ArtistItem[],
            duration: 0,
            size: f.size,
            uploadStatus: 'uploading' as const,
            uploadProgress: 0,
        }));

        setTracks((prev) => [...prev, ...newTracks]);

        newTracks.forEach(function processNewTrack(t) {
            parseBlob(t.file)
                .then((meta) => {
                    const dur = meta.format.duration ?? 0;
                    setTracks((prev) => prev.map((p) => (p.id === t.id ? { ...p, duration: dur } : p)));
                })
                .catch(() => {});

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
                });
        });
    }

    async function handleSubmit() {
        if (submitting || tracks.length === 0) return;
        if (playlistMode && !playlistName.trim()) return;

        setSubmitting(true);
        LockClosing();

        try {
            const songIds: string[] = [];

            for (const track of tracks) {
                const seen = new Set<string>();
                const artistUuids = [...albumArtists, ...track.artists]
                    .filter((a) => !seen.has(a.id) && seen.add(a.id))
                    .map((a) => a.id);
                const songId = await songsService.CreateSong(track.title || track.file.name, artistUuids, track.fileId!);
                songIds.push(songId);
            }

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
                );
                const playlistUuid = playlist.uuid ?? '';

                await Promise.all(
                    songIds.map((id) => playlistService.AddSongToPlaylist(playlistUuid, parseInt(id, 10))),
                );
            }

            setTimeout(() => {
                CloseDialog();
                refreshActive();
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
                        loadArtistOptions={loadArtistOptions}
                        onCreateArtist={handleCreateArtist}
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
                    className={`${cls.SubmitButton} ${isValid && !submitting ? cls.SubmitReady : cls.SubmitDisabled}`}
                    onClick={handleSubmit}
                    disabled={!isValid || submitting}
                >
                    {submitting ? 'uploading…' : submitLabel}
                    {!submitting && <ChevronIcon />}
                </button>
            </div>
        </div>
    );
}

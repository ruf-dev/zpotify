import { useEffect, useRef, useState } from 'react';
import { parseBlob } from 'music-metadata-browser';
import type { IAudioMetadata } from 'music-metadata-browser';

import type { Toaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { songsService } from '@/shared/api/Songs.ts';
import { fileService } from '@/shared/api/FileService.ts';
import type { FileHashResult } from '@/shared/api/FileService.ts';
import { isSupportedAudioFile } from '@/features/upload/supportedAudio.ts';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import type { SongBase } from '@/app/api/zpotify';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';
import { cleanTitle, computeHash } from '@/dialogs/MultitrackUpload/utils';
import type { UploadQueue } from '@/dialogs/MultitrackUpload/useUploadQueue';
import { useUploadQueue } from '@/dialogs/MultitrackUpload/useUploadQueue';

export interface TrackDraftsState {
    tracks: TrackDraft[];
    handleTitleChange: (id: string, title: string) => void;
    handleArtistsChange: (id: string, artists: ArtistItem[]) => void;
    handleRemove: (id: string) => void;
    handleReorder: (fromIdx: number, toIdx: number) => void;
    handleAddFiles: (incomingFiles: File[]) => void;
    handleAddSong: (song: SongBase) => void;
}

interface ClassifiedFile {
    file: File;
    hash: string;
}

interface InitialTrackMeta {
    hashes: string[];
    metas: PromiseSettledResult<IAudioMetadata>[];
    existingMap: Map<string, FileHashResult>;
    songMetaMap: Map<string, SongBase>;
}

function mapArtists(song: SongBase | undefined): ArtistItem[] {
    return (song?.artists ?? []).filter((a) => a.uuid && a.name).map((a) => ({ id: a.uuid!, name: a.name! }));
}

function createInitialTracks(files: File[]): TrackDraft[] {
    return files.map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        title: cleanTitle(f.name),
        artists: [] as ArtistItem[],
        duration: 0,
        size: f.size,
        uploadStatus: 'pending' as const,
        uploadProgress: 0,
    }));
}

async function loadInitialTrackMeta(initial: TrackDraft[]): Promise<InitialTrackMeta> {
    const [hashes, metas] = await Promise.all([
        Promise.all(initial.map((t) => computeHash(t.file!))),
        Promise.allSettled(initial.map((t) => parseBlob(t.file!))),
    ]);

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

    return { hashes, metas, existingMap, songMetaMap };
}

function mergeInitialTrack(prev: TrackDraft, i: number, meta: InitialTrackMeta): TrackDraft {
    const dur = meta.metas[i].status === 'fulfilled' ? (meta.metas[i].value.format.duration ?? 0) : 0;
    const existing = meta.existingMap.get(meta.hashes[i]);
    const song = meta.songMetaMap.get(meta.hashes[i]);
    if (!existing) return { ...prev, duration: dur };
    return {
        ...prev,
        duration: dur,
        fileId: existing.fileId,
        uploadStatus: 'done' as const,
        uploadProgress: 100,
        isExisting: true,
        linkedSongId: existing.songId,
        ...(song && { title: song.title ?? prev.title, artists: mapArtists(song) }),
    };
}

async function classifyIncomingFiles(
    incomingFiles: File[],
    knownHashes: Map<string, string>,
    toaster: Toaster,
): Promise<ClassifiedFile[]> {
    const newFiles = incomingFiles.filter(isSupportedAudioFile);
    const unsupported = incomingFiles.filter((f) => !isSupportedAudioFile(f));
    if (unsupported.length > 0) {
        toaster.bake({
            title: 'unsupported format',
            description: `only mp3, flac and aac are supported: ${unsupported.map((f) => f.name).join(', ')}`,
            level: 'Warn',
            isDismissable: true,
        });
    }
    if (newFiles.length === 0) return [];

    const hashes = await Promise.all(newFiles.map(computeHash));

    const fresh: ClassifiedFile[] = [];
    const dupeNames: string[] = [];
    newFiles.forEach(function classifyFile(file, i) {
        if (knownHashes.has(hashes[i])) {
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

    return fresh;
}

async function buildNewTracksFromFresh(fresh: ClassifiedFile[]): Promise<TrackDraft[]> {
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

    return fresh.map(({ file, hash }) => {
        const existing = existingMap.get(hash);
        const song = songMetaMap.get(hash);
        return {
            id: crypto.randomUUID(),
            file,
            title: song?.title ?? cleanTitle(file.name),
            artists: song ? mapArtists(song) : ([] as ArtistItem[]),
            duration: song?.durationSec ?? 0,
            size: file.size,
            uploadStatus: existing ? ('done' as const) : ('pending' as const),
            uploadProgress: existing ? 100 : 0,
            fileId: existing?.fileId,
            isExisting: !!existing,
            linkedSongId: existing?.songId,
        };
    });
}

function startNewTrackUploads(
    newTracks: TrackDraft[],
    setTracks: React.Dispatch<React.SetStateAction<TrackDraft[]>>,
    uploadQueue: UploadQueue,
) {
    newTracks.forEach(function processAddedTrack(t) {
        parseBlob(t.file!)
            .then((meta) => {
                const dur = meta.format.duration ?? 0;
                setTracks((prev) => prev.map((p) => (p.id === t.id ? { ...p, duration: dur } : p)));
            })
            .catch(() => {});

        if (!t.isExisting) {
            uploadQueue.startUpload(t);
        }
    });
}

export function useTrackDrafts(files: File[]): TrackDraftsState {
    const toaster = useToaster();

    const [tracks, setTracks] = useState<TrackDraft[]>(() => createInitialTracks(files));

    const tracksRef = useRef(tracks);
    tracksRef.current = tracks;

    // hash → trackId; used to de-dup files added in the same session
    const knownHashesRef = useRef<Map<string, string>>(new Map());

    const uploadQueue = useUploadQueue(setTracks);

    useEffect(() => {
        const initial = tracksRef.current;
        loadInitialTrackMeta(initial)
            .then((meta) => {
                meta.hashes.forEach((h, i) => knownHashesRef.current.set(h, initial[i].id));
                setTracks((prev) => prev.map((p, i) => mergeInitialTrack(p, i, meta)));
                initial.forEach((t, i) => {
                    if (!meta.existingMap.has(meta.hashes[i])) uploadQueue.startUpload(t);
                });
            })
            .catch(() => {});
    }, []);

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

    function handleAddFiles(incomingFiles: File[]) {
        classifyIncomingFiles(incomingFiles, knownHashesRef.current, toaster)
            .then((fresh) => {
                if (fresh.length === 0) return undefined;
                return buildNewTracksFromFresh(fresh).then((newTracks) => {
                    fresh.forEach(({ hash }, i) => knownHashesRef.current.set(hash, newTracks[i].id));
                    setTracks((prev) => [...prev, ...newTracks]);
                    startNewTrackUploads(newTracks, setTracks, uploadQueue);
                });
            })
            .catch(() => {});
    }

    function handleAddSong(song: SongBase) {
        const songId = song.id;
        if (!songId) return;
        if (tracksRef.current.some((t) => t.linkedSongId === songId)) return;

        const newTrack: TrackDraft = {
            id: crypto.randomUUID(),
            title: song.title ?? '',
            artists: mapArtists(song),
            duration: song.durationSec ?? 0,
            uploadStatus: 'done',
            uploadProgress: 100,
            fileId: song.fileId,
            isExisting: true,
            linkedSongId: songId,
        };

        setTracks((prev) => [...prev, newTrack]);
    }

    return {
        tracks,
        handleTitleChange,
        handleArtistsChange,
        handleRemove,
        handleReorder,
        handleAddFiles,
        handleAddSong,
    };
}

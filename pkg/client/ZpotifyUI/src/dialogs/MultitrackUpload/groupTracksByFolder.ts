import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';

export interface IndexedTrack {
    track: TrackDraft;
    index: number;
}

export interface TrackGroupFolder {
    name: string;
    path: string;
    startIndex: number;
    tracks: TrackDraft[];
    entries: TrackGroupEntry[];
}

export type TrackGroupEntry =
    | { kind: 'track'; track: TrackDraft; index: number }
    | { kind: 'folder'; folder: TrackGroupFolder };

interface PendingTrack extends IndexedTrack {
    segments: string[];
}

function buildEntries(pending: PendingTrack[], depth: number, parentPath: string): TrackGroupEntry[] {
    const entries: TrackGroupEntry[] = [];
    let run: PendingTrack[] = [];

    function flushRun() {
        if (run.length === 0) return;
        const name = run[0].segments[depth];
        const path = parentPath ? `${parentPath}/${name}` : name;
        const folder: TrackGroupFolder = {
            name,
            path,
            startIndex: run[0].index,
            tracks: run.map((p) => p.track),
            entries: buildEntries(run, depth + 1, path),
        };
        entries.push({ kind: 'folder', folder });
        run = [];
    }

    pending.forEach((item) => {
        if (item.segments.length <= depth) {
            flushRun();
            entries.push({ kind: 'track', track: item.track, index: item.index });
            return;
        }
        if (run.length > 0 && run[0].segments[depth] !== item.segments[depth]) flushRun();
        run.push(item);
    });
    flushRun();

    return entries;
}

// Adjacent tracks sharing a folder path prefix are grouped into nested folders; every track keeps
// its index in the original list (drag reorder works on that index).
export function groupTracksByFolder(tracks: TrackDraft[]): TrackGroupEntry[] {
    const pending = tracks.map((track, index) => ({
        track,
        index,
        segments: (track.folderName ?? '').split('/').filter((segment) => segment.length > 0),
    }));
    return buildEntries(pending, 0, '');
}

export function folderProgress(tracks: TrackDraft[]): number {
    const totalBytes = tracks.reduce((sum, t) => sum + (t.size ?? 0), 0);
    if (totalBytes === 0) {
        if (tracks.length === 0) return 0;
        return tracks.reduce((sum, t) => sum + t.uploadProgress, 0) / tracks.length;
    }
    const uploadedBytes = tracks.reduce((sum, t) => sum + (t.size ?? 0) * (t.uploadProgress / 100), 0);
    return (uploadedBytes / totalBytes) * 100;
}

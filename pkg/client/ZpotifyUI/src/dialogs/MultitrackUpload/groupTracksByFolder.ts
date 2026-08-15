import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';

export interface TrackGroupSegment {
    folderName?: string;
    tracks: TrackDraft[];
    startIndex: number;
}

export function groupTracksByFolder(tracks: TrackDraft[]): TrackGroupSegment[] {
    const segments: TrackGroupSegment[] = [];
    tracks.forEach((track, idx) => {
        const last = segments[segments.length - 1];
        if (last && last.folderName === track.folderName && track.folderName !== undefined) {
            last.tracks.push(track);
        } else {
            segments.push({ folderName: track.folderName, tracks: [track], startIndex: idx });
        }
    });
    return segments;
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

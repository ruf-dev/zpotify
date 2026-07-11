import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';

export interface MultitrackSummaryParams {
    tracks: TrackDraft[];
    playlistMode: boolean;
    playlistName: string;
    albumArtists: ArtistItem[];
}

export interface MultitrackSummary {
    linkedSongIds: Set<string>;
    totalDuration: number;
    totalBytes: number;
    hasUploadError: boolean;
    isUploading: boolean;
    isValid: boolean;
    isAlbum: boolean;
    titleText: string;
    submitLabel: string;
    validationHint: string;
}

function buildValidationHint(
    params: MultitrackSummaryParams,
    hasUploadError: boolean,
    isUploading: boolean,
    isValid: boolean,
): string {
    if (hasUploadError) return 'some files failed to upload';
    if (isUploading) return 'uploading files…';
    if (!isValid && params.playlistMode && !params.playlistName.trim() && params.tracks.length > 0) {
        return 'name the playlist to continue';
    }
    if (params.tracks.length === 0) return 'add at least one track';
    return '';
}

export function useMultitrackSummary(params: MultitrackSummaryParams): MultitrackSummary {
    const { tracks, playlistMode, playlistName, albumArtists } = params;

    const linkedSongIds = new Set(tracks.map((t) => t.linkedSongId).filter((id): id is string => !!id));
    const totalDuration = tracks.reduce((s, t) => s + t.duration, 0);
    const totalBytes = tracks.reduce((s, t) => s + (t.size ?? 0), 0);
    const allUploaded = tracks.length > 0 && tracks.every((t) => t.uploadStatus === 'done');
    const hasUploadError = tracks.some((t) => t.uploadStatus === 'error');
    const isUploading =
        !hasUploadError && tracks.some((t) => t.uploadStatus === 'pending' || t.uploadStatus === 'uploading');
    const isValid = tracks.length > 0 && (!playlistMode || playlistName.trim().length > 0) && allUploaded;
    const isAlbum = playlistMode && albumArtists.length > 0;
    const titleText = playlistMode ? (isAlbum ? 'new album' : 'new playlist') : 'upload tracks';
    const submitLabel = playlistMode ? (isAlbum ? 'create album' : 'create playlist') : 'upload tracks';
    const validationHint = buildValidationHint(params, hasUploadError, isUploading, isValid);

    return {
        linkedSongIds,
        totalDuration,
        totalBytes,
        hasUploadError,
        isUploading,
        isValid,
        isAlbum,
        titleText,
        submitLabel,
        validationHint,
    };
}

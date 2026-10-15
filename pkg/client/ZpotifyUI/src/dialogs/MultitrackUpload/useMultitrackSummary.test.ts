import { describe, expect, it } from 'vitest';

import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';
import { useMultitrackSummary as summaryHook } from '@/dialogs/MultitrackUpload/useMultitrackSummary';

function makeTrack(id: string, title: string): TrackDraft {
    return { id, title, artists: [], duration: 180, uploadStatus: 'done', uploadProgress: 100, fileId: id };
}

function renderSummary(tracks: TrackDraft[], playlistName: string) {
    return summaryHook({ tracks, playlistMode: true, playlistName, isSingle: true, albumArtists: [] });
}

describe('useMultitrackSummary single mode', () => {
    it('is valid for exactly one titled track and labels the action as a single', () => {
        const summary = renderSummary([makeTrack('1', 'Song')], 'Song');

        expect(summary.isValid).toBe(true);
        expect(summary.submitLabel).toBe('create single');
        expect(summary.titleText).toBe('new single');
    });

    it('is invalid with more than one track and explains why', () => {
        const summary = renderSummary([makeTrack('1', 'A'), makeTrack('2', 'B')], 'A');

        expect(summary.isValid).toBe(false);
        expect(summary.validationHint).toBe('a single holds exactly one track');
    });

    it('is invalid with an empty track title', () => {
        const summary = renderSummary([makeTrack('1', '')], '');

        expect(summary.isValid).toBe(false);
        expect(summary.validationHint).toBe('give the track a title to continue');
    });
});

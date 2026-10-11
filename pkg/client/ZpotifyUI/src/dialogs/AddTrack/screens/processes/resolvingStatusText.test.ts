import { describe, expect, it } from 'vitest';

import { resolvingStatusText } from '@/dialogs/AddTrack/screens/processes/resolvingStatusText.ts';

describe('resolvingStatusText', () => {
    it('returns the peer search text when 0 seconds elapsed', () => {
        expect(resolvingStatusText(0)).toBe('Looking for peers…');
    });

    it('returns the peer search text when 9 seconds elapsed', () => {
        expect(resolvingStatusText(9)).toBe('Looking for peers…');
    });

    it('returns the swarm text when 10 seconds elapsed', () => {
        expect(resolvingStatusText(10)).toBe('Asking the swarm for metadata…');
    });

    it('returns the swarm text when 29 seconds elapsed', () => {
        expect(resolvingStatusText(29)).toBe('Asking the swarm for metadata…');
    });

    it('returns the slow torrent text when 30 seconds elapsed', () => {
        expect(resolvingStatusText(30)).toBe('Still searching — less popular torrents take longer…');
    });

    it('returns the slow torrent text when 89 seconds elapsed', () => {
        expect(resolvingStatusText(89)).toBe('Still searching — less popular torrents take longer…');
    });

    it('returns the no peers text when 90 seconds elapsed', () => {
        expect(resolvingStatusText(90)).toBe('Almost out of time — this torrent may have no active peers.');
    });

    it('returns the no peers text when 500 seconds elapsed', () => {
        expect(resolvingStatusText(500)).toBe('Almost out of time — this torrent may have no active peers.');
    });
});

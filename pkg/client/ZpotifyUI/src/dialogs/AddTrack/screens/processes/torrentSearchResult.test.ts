import { describe, expect, it } from 'vitest';

import {
    formatTorrentAge,
    formatTorrentSize,
    isLosslessTitle,
} from '@/dialogs/AddTrack/screens/processes/torrentSearchResult';

describe('isLosslessTitle', () => {
    const cases: [string, boolean][] = [
        ['Artist - Album (2020) [FLAC]', true],
        ['Artist - Album 24-bit 96kHz', true],
        ['Artist - Album 24bit', true],
        ['Artist - Album Hi-Res', true],
        ['Artist - Album [Lossless]', true],
        ['Artist - Album WAV', true],
        ['Artist - Album MP3 320', false],
        ['Artist - Landscape', false],
        ['Artist - Escape', false],
    ];

    it.each(cases)('classifies %s as lossless=%s', (title, expected) => {
        expect(isLosslessTitle(title)).toBe(expected);
    });
});

describe('formatTorrentSize', () => {
    const cases: [string | undefined, string][] = [
        [undefined, ''],
        ['', ''],
        ['abc', ''],
        ['512', '512 B'],
        ['2048', '2 KB'],
        ['5242880', '5.0 MB'],
        ['1288490189', '1.2 GB'],
        ['2199023255552', '2.0 TB'],
    ];

    it.each(cases)('formats %s as "%s"', (input, expected) => {
        expect(formatTorrentSize(input)).toBe(expected);
    });
});

describe('formatTorrentAge', () => {
    const now = new Date('2026-10-11T12:00:00Z');
    const cases: [string | undefined, string][] = [
        [undefined, ''],
        ['not a date', ''],
        ['2026-10-11T01:00:00Z', 'today'],
        ['2026-10-08T12:00:00Z', '3 d ago'],
        ['2026-07-11T12:00:00Z', '3 mo ago'],
        ['2023-10-01T12:00:00Z', '3 y ago'],
    ];

    it.each(cases)('formats %s as "%s"', (input, expected) => {
        expect(formatTorrentAge(input, now)).toBe(expected);
    });
});

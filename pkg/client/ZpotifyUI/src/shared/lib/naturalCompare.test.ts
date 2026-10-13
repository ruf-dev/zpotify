import { describe, expect, it } from 'vitest';

import { naturalCompare } from '@/shared/lib/naturalCompare.ts';

describe('naturalCompare', () => {
    it('orders numeric segments by value when the numbers have different widths', () => {
        const sorted = ['10', '02', '06'].sort(naturalCompare);

        expect(sorted).toEqual(['02', '06', '10']);
    });

    it('ignores case when comparing names with numbers', () => {
        expect(naturalCompare('track 2.flac', 'Track 10.flac')).toBeLessThan(0);
    });

    it('returns zero when the strings are equal', () => {
        expect(naturalCompare('Album 01', 'Album 01')).toBe(0);
    });
});

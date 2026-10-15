import { describe, expect, it } from 'vitest';

import { formatBytes } from '@/pages/storages/processes/formatBytes.ts';

describe('formatBytes', () => {
    it('returns 0 B when the value is zero or invalid', () => {
        expect(formatBytes(0)).toBe('0 B');
        expect(formatBytes(-5)).toBe('0 B');
        expect(formatBytes(Number.NaN)).toBe('0 B');
    });

    it('keeps plain bytes below one kilobyte', () => {
        expect(formatBytes(512)).toBe('512 B');
    });

    it('uses one decimal below ten units and none above', () => {
        expect(formatBytes(1536)).toBe('1.5 KB');
        expect(formatBytes(1024 * 1024 * 12)).toBe('12 MB');
    });

    it('scales up to gigabytes and terabytes', () => {
        expect(formatBytes(1024 ** 3 * 3)).toBe('3 GB');
        expect(formatBytes(1024 ** 4 * 2.5)).toBe('2.5 TB');
    });
});

import { describe, expect, it } from 'vitest';

import { PlaylistKind } from '@/shared/api/PlaylistKind.ts';
import { isSingle } from '@/entities/playlist/isSingle.ts';

describe('isSingle', () => {
    it('is true for a single kind', () => {
        expect(isSingle({ kind: PlaylistKind.PLAYLIST_KIND_SINGLE })).toBe(true);
    });

    it('is false for a playlist kind', () => {
        expect(isSingle({ kind: PlaylistKind.PLAYLIST_KIND_PLAYLIST })).toBe(false);
    });

    it('is false for an unspecified or missing kind', () => {
        expect(isSingle({ kind: PlaylistKind.PLAYLIST_KIND_UNSPECIFIED })).toBe(false);
        expect(isSingle({})).toBe(false);
    });
});

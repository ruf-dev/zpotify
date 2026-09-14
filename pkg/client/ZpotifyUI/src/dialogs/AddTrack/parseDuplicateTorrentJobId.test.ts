import { describe, it, expect } from 'vitest';

import { parseDuplicateTorrentJobId } from '@/dialogs/AddTrack/parseDuplicateTorrentJobId.ts';
import { ServiceError, WithDescription, WithStatusCode } from '@/shared/api/Errors.ts';

function serviceError(statusCode: number, details: string): ServiceError {
    return new ServiceError(WithStatusCode(statusCode), WithDescription(details));
}

describe('parseDuplicateTorrentJobId', () => {
    it('extracts the job id from a 409 conflict body', () => {
        const err = serviceError(409, '{"id": 42}');

        expect(parseDuplicateTorrentJobId(err)).toBe('42');
    });

    it('returns undefined for a non-409 status', () => {
        const err = serviceError(400, '{"id": 42}');

        expect(parseDuplicateTorrentJobId(err)).toBeUndefined();
    });

    it('returns undefined for a 409 body that is not valid JSON', () => {
        const err = serviceError(409, 'torrent client unavailable');

        expect(parseDuplicateTorrentJobId(err)).toBeUndefined();
    });

    it('returns undefined for a 409 body missing an id', () => {
        const err = serviceError(409, '{"error": "conflict"}');

        expect(parseDuplicateTorrentJobId(err)).toBeUndefined();
    });

    it('returns undefined for a plain non-ServiceError error', () => {
        expect(parseDuplicateTorrentJobId(new Error('boom'))).toBeUndefined();
    });
});

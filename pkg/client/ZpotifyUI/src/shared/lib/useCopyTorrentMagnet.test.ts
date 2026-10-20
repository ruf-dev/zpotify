import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useCopyTorrentMagnet } from '@/shared/lib/useCopyTorrentMagnet.ts';
import type { TorrentJob } from '@/app/api/zpotify';

const getTorrentMagnetMock = vi.fn();
vi.mock('@/shared/api/TorrentService.ts', () => ({
    torrentService: {
        GetTorrentMagnet: (...args: unknown[]) => getTorrentMagnetMock(...args),
    },
}));

const bakeMock = vi.fn();
const catchMock = vi.fn();
vi.mock('@/shared/lib/toaster/ToasterZ.ts', () => ({
    useToaster: () => ({ bake: bakeMock, catch: catchMock }),
}));

const writeTextMock = vi.fn();

function makeJob(overrides: Partial<TorrentJob>): TorrentJob {
    return { id: 'job1', torrentName: 'ubuntu.torrent', ...overrides };
}

describe('useCopyTorrentMagnet', () => {
    beforeEach(() => {
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText: writeTextMock },
        });
        getTorrentMagnetMock.mockResolvedValue({ magnetUri: 'magnet:?xt=urn:btih:abc' });
        writeTextMock.mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('copies the magnet uri and shows an info toast when the job is public', async () => {
        const { result } = renderHook(() => useCopyTorrentMagnet());

        await result.current.copyMagnet(makeJob({}));

        expect(getTorrentMagnetMock).toHaveBeenCalledWith({ jobId: 'job1' });
        expect(writeTextMock).toHaveBeenCalledWith('magnet:?xt=urn:btih:abc');
        expect(bakeMock).toHaveBeenCalledTimes(1);
        expect(bakeMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'magnet link copied', level: 'Info' }));
    });

    it('adds a warn toast when the job is from a private tracker', async () => {
        const { result } = renderHook(() => useCopyTorrentMagnet());

        await result.current.copyMagnet(makeJob({ isPrivate: true }));

        expect(bakeMock).toHaveBeenCalledTimes(2);
        expect(bakeMock).toHaveBeenLastCalledWith(
            expect.objectContaining({ title: 'private tracker torrent', level: 'Warn' }),
        );
    });

    it('shows an error toast when the clipboard write is rejected', async () => {
        writeTextMock.mockRejectedValue(new Error('denied'));
        const { result } = renderHook(() => useCopyTorrentMagnet());

        await result.current.copyMagnet(makeJob({ isPrivate: true }));

        expect(bakeMock).toHaveBeenCalledTimes(1);
        expect(bakeMock).toHaveBeenCalledWith(
            expect.objectContaining({ title: 'could not copy magnet link', level: 'Error' }),
        );
    });

    it('routes the error to the toaster catch when the api call fails', async () => {
        const failure = new Error('boom');
        getTorrentMagnetMock.mockRejectedValue(failure);
        const { result } = renderHook(() => useCopyTorrentMagnet());

        await result.current.copyMagnet(makeJob({}));

        expect(catchMock).toHaveBeenCalledWith(failure);
        expect(writeTextMock).not.toHaveBeenCalled();
    });

    it('does nothing when the job has no id', async () => {
        const { result } = renderHook(() => useCopyTorrentMagnet());

        await result.current.copyMagnet(makeJob({ id: undefined }));

        expect(getTorrentMagnetMock).not.toHaveBeenCalled();
    });
});

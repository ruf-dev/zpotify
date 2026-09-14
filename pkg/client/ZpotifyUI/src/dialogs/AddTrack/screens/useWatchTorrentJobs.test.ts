import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook, waitFor } from '@testing-library/react';

import type { TorrentJob } from '@/app/api/zpotify';
import { useWatchTorrentJobs } from '@/dialogs/AddTrack/screens/useWatchTorrentJobs';

const watchTorrentJobsMock = vi.fn();
vi.mock('@/shared/api/TorrentService.ts', () => ({
    torrentService: {
        WatchTorrentJobs: (req: unknown, cb: unknown, signal: unknown) => watchTorrentJobsMock(req, cb, signal),
    },
}));

function makeJob(overrides: Partial<TorrentJob>): TorrentJob {
    return { id: '1', torrentName: 'ubuntu.torrent', status: 'downloading', ...overrides };
}

describe('useWatchTorrentJobs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('should start watching torrent jobs on mount', async () => {
        watchTorrentJobsMock.mockResolvedValue(undefined);

        const { result } = renderHook(() => useWatchTorrentJobs());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(watchTorrentJobsMock).toHaveBeenCalledWith(
            { folderName: undefined, limit: 3 },
            expect.any(Function),
            expect.any(AbortSignal),
        );
    });

    it('should pass the correct limit to the request', async () => {
        watchTorrentJobsMock.mockResolvedValue(undefined);

        const { result } = renderHook(() => useWatchTorrentJobs(undefined, 5));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(watchTorrentJobsMock).toHaveBeenCalledWith(
            { folderName: undefined, limit: 5 },
            expect.any(Function),
            expect.any(AbortSignal),
        );
    });

    it('should update job state when stream callback is called', async () => {
        let streamCallback: unknown = null;

        watchTorrentJobsMock.mockImplementation((_req: unknown, cb: unknown) => {
            streamCallback = cb;
            return Promise.resolve();
        });

        const { result } = renderHook(() => useWatchTorrentJobs());

        await waitFor(() => expect(streamCallback).not.toBeNull());

        const job1 = makeJob({ id: '1', torrentName: 'ubuntu.torrent' });
        (streamCallback as (response: { job?: TorrentJob }) => void)({ job: job1 });

        await waitFor(() => {
            expect(result.current.jobs).toContainEqual(expect.objectContaining({ id: '1' }));
        });
    });

    it('should update existing job when same id appears in stream', async () => {
        let streamCallback: unknown = null;

        watchTorrentJobsMock.mockImplementation((_req: unknown, cb: unknown) => {
            streamCallback = cb;
            return Promise.resolve();
        });

        const { result } = renderHook(() => useWatchTorrentJobs());

        await waitFor(() => expect(streamCallback).not.toBeNull());

        const job1 = makeJob({ id: '1', status: 'downloading' });
        (streamCallback as (response: { job?: TorrentJob }) => void)({ job: job1 });

        await waitFor(() => {
            expect(result.current.jobs[0]?.status).toBe('downloading');
        });

        const updatedJob = makeJob({ id: '1', status: 'done' });
        (streamCallback as (response: { job?: TorrentJob }) => void)({ job: updatedJob });

        await waitFor(() => {
            expect(result.current.jobs[0]?.status).toBe('done');
        });

        expect(result.current.jobs).toHaveLength(1);
    });

    it('should limit displayed jobs to the specified limit', async () => {
        let streamCallback: unknown = null;

        watchTorrentJobsMock.mockImplementation((_req: unknown, cb: unknown) => {
            streamCallback = cb;
            return Promise.resolve();
        });

        const { result } = renderHook(() => useWatchTorrentJobs(undefined, 2));

        await waitFor(() => expect(streamCallback).not.toBeNull());

        const cb = streamCallback as (response: { job?: TorrentJob }) => void;
        cb({ job: makeJob({ id: '1' }) });
        cb({ job: makeJob({ id: '2' }) });
        cb({ job: makeJob({ id: '3' }) });
        cb({ job: makeJob({ id: '4' }) });

        await waitFor(() => {
            expect(result.current.jobs.length).toBeLessThanOrEqual(2);
        });
    });

    it('should set loading to false after stream resolves', async () => {
        watchTorrentJobsMock.mockResolvedValue(undefined);

        const { result } = renderHook(() => useWatchTorrentJobs());

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('should set loading to false even if stream rejects', async () => {
        watchTorrentJobsMock.mockRejectedValue(new Error('stream error'));

        const { result } = renderHook(() => useWatchTorrentJobs());

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('should abort the stream signal on unmount', async () => {
        let capturedSignal: AbortSignal | null = null;

        watchTorrentJobsMock.mockImplementation((_req: unknown, _cb: unknown, signal: AbortSignal) => {
            capturedSignal = signal;
            return Promise.resolve();
        });

        const { unmount } = renderHook(() => useWatchTorrentJobs());

        await waitFor(() => expect(capturedSignal).not.toBeNull());
        expect((capturedSignal as unknown as AbortSignal).aborted).toBe(false);

        unmount();

        expect((capturedSignal as unknown as AbortSignal).aborted).toBe(true);
    });
});

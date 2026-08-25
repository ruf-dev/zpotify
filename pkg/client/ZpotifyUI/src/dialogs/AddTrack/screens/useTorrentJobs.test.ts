import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';

import type { TorrentJob } from '@/app/api/zpotify';
import { useTorrentJobs } from '@/dialogs/AddTrack/screens/useTorrentJobs.ts';

const listTorrentJobsMock = vi.fn();
vi.mock('@/shared/api/TorrentService.ts', () => ({
    torrentService: {
        ListTorrentJobs: (...args: unknown[]) => listTorrentJobsMock(...args),
    },
}));

function makeJob(overrides: Partial<TorrentJob>): TorrentJob {
    return { id: '1', torrentName: 'ubuntu.torrent', status: 'downloading', ...overrides };
}

describe('useTorrentJobs', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    it('fetches jobs on mount', async () => {
        const jobs = [makeJob({})];
        listTorrentJobsMock.mockResolvedValue({ jobs });

        const { result } = renderHook(() => useTorrentJobs('myFolder'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.jobs).toEqual(jobs);
        expect(listTorrentJobsMock).toHaveBeenCalledWith({ folderName: 'myFolder' });
    });

    it('keeps polling while a job is non-terminal', async () => {
        listTorrentJobsMock.mockResolvedValue({ jobs: [makeJob({ status: 'downloading' })] });

        const { result } = renderHook(() => useTorrentJobs());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(listTorrentJobsMock).toHaveBeenCalledTimes(1);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(2500);
        });
        expect(listTorrentJobsMock).toHaveBeenCalledTimes(2);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(2500);
        });
        expect(listTorrentJobsMock).toHaveBeenCalledTimes(3);
    });

    it('stops polling once every job is terminal', async () => {
        listTorrentJobsMock.mockResolvedValue({ jobs: [makeJob({ status: 'done' })] });

        const { result } = renderHook(() => useTorrentJobs());
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(listTorrentJobsMock).toHaveBeenCalledTimes(1);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(10000);
        });

        // no interval was ever scheduled since the only job is already terminal
        expect(listTorrentJobsMock).toHaveBeenCalledTimes(1);
    });

    it('transitions from polling to stopped once a job becomes terminal', async () => {
        listTorrentJobsMock
            .mockResolvedValueOnce({ jobs: [makeJob({ status: 'downloading' })] })
            .mockResolvedValueOnce({ jobs: [makeJob({ status: 'done' })] });

        const { result } = renderHook(() => useTorrentJobs());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await vi.advanceTimersByTimeAsync(2500);
        });
        expect(listTorrentJobsMock).toHaveBeenCalledTimes(2);
        expect(result.current.jobs[0].status).toBe('done');

        await act(async () => {
            await vi.advanceTimersByTimeAsync(10000);
        });
        // interval cleared once the job reached a terminal status
        expect(listTorrentJobsMock).toHaveBeenCalledTimes(2);
    });
});

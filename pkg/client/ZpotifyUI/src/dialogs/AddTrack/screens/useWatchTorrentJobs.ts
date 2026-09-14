import { useEffect, useState } from 'react';

import type { TorrentJob, WatchTorrentJobsResponse } from '@/app/api/zpotify';
import { torrentService } from '@/shared/api/TorrentService.ts';

export function useWatchTorrentJobs(folderName?: string, limit: number = 3) {
    const [jobs, setJobs] = useState<TorrentJob[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const request = {
            folderName,
            limit,
        };

        const abortController = new AbortController();

        function handleJobUpdate(response: WatchTorrentJobsResponse) {
            const job = response.job;
            if (!job || !job.id) return;

            setJobs((prev) => {
                const existing = prev.find((j) => j.id === job.id);
                if (existing) {
                    return prev.map((j) => (j.id === job.id ? job : j));
                }
                return [job, ...prev].slice(0, limit);
            });
        }

        setLoading(true);

        torrentService
            .WatchTorrentJobs(request, handleJobUpdate, abortController.signal)
            .then(() => {
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });

        return () => {
            abortController.abort();
        };
    }, [folderName, limit]);

    return { jobs, loading };
}

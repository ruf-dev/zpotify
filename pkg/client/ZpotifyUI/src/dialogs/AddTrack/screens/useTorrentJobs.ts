import { useEffect, useState } from 'react';

import type { TorrentJob } from '@/app/api/zpotify';
import { torrentService } from '@/shared/api/TorrentService.ts';
import { isTerminalTorrentStatus } from '@/shared/lib/torrentStatus.ts';

const POLL_INTERVAL_MS = 2500;

export function useTorrentJobs(folderName?: string) {
    const [jobs, setJobs] = useState<TorrentJob[]>([]);
    const [loading, setLoading] = useState(true);

    function fetchJobs() {
        return torrentService.ListTorrentJobs({ folderName }).then((res) => setJobs(res.jobs ?? []));
    }

    useEffect(() => {
        fetchJobs().finally(() => setLoading(false));
    }, []);

    const hasActiveJob = jobs.some((job) => !isTerminalTorrentStatus(job.status));

    useEffect(() => {
        if (!hasActiveJob) return undefined;

        const intervalId = setInterval(() => {
            fetchJobs().catch(() => {});
        }, POLL_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [hasActiveJob]);

    return { jobs, loading, refetch: fetchJobs };
}

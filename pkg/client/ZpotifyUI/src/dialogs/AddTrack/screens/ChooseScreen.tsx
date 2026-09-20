import { useEffect, useState } from 'react';

import cls from '@/dialogs/AddTrack/screens/ChooseScreen.module.css';
import useUser from '@/entities/user/useUser.ts';
import { fileService } from '@/shared/api/FileService.ts';
import { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';
import CreatePlaylistCard from '@/dialogs/AddTrack/screens/components/CreatePlaylistCard/CreatePlaylistCard';
import LibraryCard from '@/dialogs/AddTrack/screens/components/LibraryCard/LibraryCard';
import UploadCard from '@/dialogs/AddTrack/screens/components/UploadCard/UploadCard';
import RecentTorrentsPanel from '@/dialogs/AddTrack/screens/components/RecentTorrentsPanel/RecentTorrentsPanel';
import { useWatchTorrentJobs } from '@/dialogs/AddTrack/screens/useWatchTorrentJobs';
import { isTerminalTorrentStatus } from '@/shared/lib/torrentStatus.ts';

export default function ChooseScreen({ goTo, handleCreatePlaylist, handleTorrentFile }: AddTrackContext) {
    const { userData } = useUser();

    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { jobs, loading: torrentLoading } = useWatchTorrentJobs();

    useEffect(() => {
        fileService
            .ListUploadedFiles({ temporaryOnly: true })
            .then((res) => setPendingCount((res.files || []).length))
            .finally(() => setLoading(false));
    }, []);

    const maxPendingTracks = Number(userData?.permissions?.maxPendingTracks ?? 0);
    const atLimit = maxPendingTracks === 0 || pendingCount >= maxPendingTracks;
    const hasActiveTorrentJob = jobs.some((job) => !isTerminalTorrentStatus(job.status));

    function handleTorrentFileSelected(file: File) {
        handleTorrentFile(file);
        goTo('drop');
    }

    return (
        <div className={cls.ChooseScreenContainer}>
            <div className={cls.GridWrapper}>
                <CreatePlaylistCard onClick={handleCreatePlaylist} />
                <LibraryCard
                    pendingCount={pendingCount}
                    onClick={() => goTo('pending')}
                    disabled={pendingCount === 0 && !hasActiveTorrentJob}
                />
                <UploadCard
                    atLimit={atLimit}
                    loading={loading}
                    pendingCount={pendingCount}
                    maxPendingTracks={maxPendingTracks}
                    onClick={() => goTo('drop')}
                />
            </div>

            <RecentTorrentsPanel jobs={jobs} loading={torrentLoading} onFile={handleTorrentFileSelected} />
        </div>
    );
}

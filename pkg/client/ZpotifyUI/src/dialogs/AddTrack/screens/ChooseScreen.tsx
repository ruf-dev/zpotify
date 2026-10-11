import { useEffect, useState } from 'react';
import { Button } from '@vervstack/chures';

import cls from '@/dialogs/AddTrack/screens/ChooseScreen.module.css';
import useUser from '@/entities/user/useUser.ts';
import { fileService } from '@/shared/api/FileService.ts';
import { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';
import CreatePlaylistCard from '@/dialogs/AddTrack/screens/components/CreatePlaylistCard/CreatePlaylistCard';
import LibraryCard from '@/dialogs/AddTrack/screens/components/LibraryCard/LibraryCard';
import UploadCard from '@/dialogs/AddTrack/screens/components/UploadCard/UploadCard';
import MagnetLinkField from '@/dialogs/AddTrack/screens/components/MagnetLinkField/MagnetLinkField';
import RecentTorrentsPanel from '@/dialogs/AddTrack/screens/components/RecentTorrentsPanel/RecentTorrentsPanel';
import { useWatchTorrentJobs } from '@/dialogs/AddTrack/screens/useWatchTorrentJobs';
import { useTorrentSearchAvailability } from '@/features/upload/useTorrentSearchAvailability.ts';
import { isTerminalTorrentStatus } from '@/shared/lib/torrentStatus.ts';
import ClipboardAccessButton from '@/dialogs/AddTrack/screens/components/ClipboardAccessButton/ClipboardAccessButton';

export default function ChooseScreen({
    goTo,
    uploading,
    handleCreatePlaylist,
    handleTorrentFile,
    handleMagnetLink,
}: AddTrackContext) {
    const { userData } = useUser();

    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [clipboardMagnet, setClipboardMagnet] = useState('');
    const { jobs, loading: torrentLoading } = useWatchTorrentJobs();
    const isTorrentSearchAvailable = useTorrentSearchAvailability();

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

    function handleOpenSearch() {
        goTo('search');
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

            <div className={cls.MagnetRow}>
                <div className={cls.MagnetFieldWrapper}>
                    <MagnetLinkField initialValue={clipboardMagnet} disabled={uploading} onSubmit={handleMagnetLink} />
                </div>
                <ClipboardAccessButton onMagnet={setClipboardMagnet} />
                {isTorrentSearchAvailable && (
                    <Button variant="ghost" onClick={handleOpenSearch}>
                        Search torrents
                    </Button>
                )}
            </div>

            <RecentTorrentsPanel jobs={jobs} loading={torrentLoading} onFile={handleTorrentFileSelected} />
        </div>
    );
}

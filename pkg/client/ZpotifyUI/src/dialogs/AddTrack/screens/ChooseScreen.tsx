import { useEffect, useState } from 'react';

import cls from '@/dialogs/AddTrack/screens/ChooseScreen.module.css';
import useUser from '@/entities/user/useUser.ts';
import { fileService } from '@/shared/api/FileService.ts';
import { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';
import CreatePlaylistCard from '@/dialogs/AddTrack/screens/components/CreatePlaylistCard/CreatePlaylistCard';
import LibraryCard from '@/dialogs/AddTrack/screens/components/LibraryCard/LibraryCard';
import UploadCard from '@/dialogs/AddTrack/screens/components/UploadCard/UploadCard';

export default function ChooseScreen({ goTo, handleCreatePlaylist }: AddTrackContext) {
    const { userData } = useUser();

    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fileService
            .ListUploadedFiles({ temporaryOnly: true })
            .then((res) => setPendingCount((res.files || []).length))
            .finally(() => setLoading(false));
    }, []);

    const maxPendingTracks = Number(userData?.permissions?.maxPendingTracks ?? 0);
    const atLimit = maxPendingTracks === 0 || pendingCount >= maxPendingTracks;

    return (
        <div className={cls.ChooseScreenContainer}>
            <div className={cls.GridWrapper}>
                <CreatePlaylistCard onClick={handleCreatePlaylist} />
                <LibraryCard
                    pendingCount={pendingCount}
                    onClick={() => goTo('pending')}
                    disabled={pendingCount === 0}
                />
                <UploadCard
                    atLimit={atLimit}
                    loading={loading}
                    pendingCount={pendingCount}
                    maxPendingTracks={maxPendingTracks}
                    onClick={() => goTo('drop')}
                />
            </div>
        </div>
    );
}

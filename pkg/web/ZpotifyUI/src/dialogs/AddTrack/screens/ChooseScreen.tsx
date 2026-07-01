import { useEffect, useState } from 'react';
import cn from 'classnames';

import cls from '@/dialogs/AddTrack/screens/ChooseScreen.module.css';
import useUser from '@/entities/user/useUser.ts';
import { fileService } from '@/shared/api/FileService.ts';
import { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';

function CreatePlaylistCard({ onClick }: { onClick: () => void }) {
    return (
        <div className={cn(cls.Card, cls.CardWide)} onClick={onClick}>
            <div className={cls.IconCircle}>
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 6h11M3 12h11M3 18h7" />
                    <path d="M19 12v7M15.5 15.5h7" />
                </svg>
            </div>
            <div className={cls.CardWideText}>
                <span className={cls.CardTitle}>Create playlist</span>
                <span className={cls.CardSubtitle}>start an empty playlist and add tracks</span>
            </div>
        </div>
    );
}

function LibraryCard({
    onClick,
    disabled,
    pendingCount,
}: {
    onClick: () => void;
    disabled: boolean;
    pendingCount: number;
}) {
    return (
        <div className={`${cls.Card} ${disabled ? cls.CardDisabled : ''}`} onClick={disabled ? undefined : onClick}>
            <div className={cls.IconCircle}>
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                </svg>
            </div>
            <span className={cls.CardTitle}>
                Pending {pendingCount} upload{pendingCount == 1 ? '' : 's'}{' '}
            </span>
            <span className={cls.CardSubtitle}>assign an already-uploaded file</span>
        </div>
    );
}

interface UploadCardProps {
    atLimit: boolean;
    loading: boolean;
    pendingCount: number;
    maxPendingTracks: number;
    onClick: () => void;
}

function UploadCard({ atLimit, loading, pendingCount, maxPendingTracks, onClick }: UploadCardProps) {
    return (
        <div
            className={`${cls.Card} ${cls.CardAccent} ${atLimit ? cls.CardDisabled : ''}`}
            onClick={atLimit ? undefined : onClick}
        >
            <div className={cls.IconCircleAccent}>
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 16V4M8 8l4-4 4 4" />
                    <path d="M4 20h16" />
                </svg>
            </div>
            <span className={cls.CardTitle}>upload new</span>
            <span className={`${cls.CardSubtitle} ${atLimit ? '' : cls.CardSubtitleAccent}`}>
                {atLimit ? 'upload limit reached' : 'drop a file from your device'}
            </span>
            {!loading && maxPendingTracks > 0 && (
                <span className={`${cls.UsageChip} ${atLimit ? cls.UsageChipLimit : ''}`}>
                    {maxPendingTracks - pendingCount} / {maxPendingTracks} available to upload
                </span>
            )}
        </div>
    );
}

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

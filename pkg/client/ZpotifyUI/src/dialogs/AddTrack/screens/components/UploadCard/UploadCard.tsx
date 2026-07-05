import cn from 'classnames';

import cls from '@/dialogs/AddTrack/screens/ChooseScreen.module.css';

interface UploadCardProps {
    atLimit: boolean;
    loading: boolean;
    pendingCount: number;
    maxPendingTracks: number;
    onClick: () => void;
}

export default function UploadCard({ atLimit, loading, pendingCount, maxPendingTracks, onClick }: UploadCardProps) {
    return (
        <div
            className={cn(cls.Card, cls.CardAccent, atLimit && cls.CardDisabled)}
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
            <span className={cn(cls.CardSubtitle, !atLimit && cls.CardSubtitleAccent)}>
                {atLimit ? 'upload limit reached' : 'drop a file from your device'}
            </span>
            {!loading && maxPendingTracks > 0 && (
                <span className={cn(cls.UsageChip, atLimit && cls.UsageChipLimit)}>
                    {maxPendingTracks - pendingCount} / {maxPendingTracks} available to upload
                </span>
            )}
        </div>
    );
}

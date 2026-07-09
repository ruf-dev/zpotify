import cn from 'classnames';

import { UploadArrowLargeIcon } from '@/assets/icons/UploadArrowLargeIcon';
import cls from '@/dialogs/AddTrack/screens/components/UploadCard/UploadCard.module.css';

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
            className={cn(cls.UploadCardContainer, atLimit && cls.CardDisabled)}
            onClick={atLimit ? undefined : onClick}
        >
            <div className={cls.IconCircleAccent}>
                <UploadArrowLargeIcon />
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

import cn from 'classnames';

import MusicFileIcon from '@/assets/icons/MusicFileIcon';
import cls from '@/dialogs/AddTrack/screens/components/LibraryCard/LibraryCard.module.css';

interface LibraryCardProps {
    onClick: () => void;
    disabled: boolean;
    pendingCount: number;
    isLoading: boolean;
}

export default function LibraryCard({ onClick, disabled, pendingCount, isLoading }: LibraryCardProps) {
    const isInert = disabled || isLoading;

    return (
        <div
            className={cn(cls.LibraryCardContainer, disabled && cls.CardDisabled, isLoading && cls.CardLoading)}
            onClick={isInert ? undefined : onClick}
            aria-busy={isLoading}
        >
            <div className={cls.IconCircle}>
                <MusicFileIcon width={22} height={22} />
            </div>
            {isLoading ? (
                <>
                    <div className={cls.TitleSkeleton} />
                    <div className={cls.SubtitleSkeleton} />
                </>
            ) : (
                <>
                    <span className={cls.CardTitle}>
                        Pending {pendingCount} upload{pendingCount == 1 ? '' : 's'}{' '}
                    </span>
                    <span className={cls.CardSubtitle}>assign an already-uploaded file</span>
                </>
            )}
        </div>
    );
}

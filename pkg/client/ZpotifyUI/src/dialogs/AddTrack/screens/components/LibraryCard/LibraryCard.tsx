import cn from 'classnames';

import MusicFileIcon from '@/assets/icons/MusicFileIcon';
import cls from '@/dialogs/AddTrack/screens/components/LibraryCard/LibraryCard.module.css';

interface LibraryCardProps {
    onClick: () => void;
    disabled: boolean;
    pendingCount: number;
}

export default function LibraryCard({ onClick, disabled, pendingCount }: LibraryCardProps) {
    return (
        <div
            className={cn(cls.LibraryCardContainer, disabled && cls.CardDisabled)}
            onClick={disabled ? undefined : onClick}
        >
            <div className={cls.IconCircle}>
                <MusicFileIcon width={22} height={22} />
            </div>
            <span className={cls.CardTitle}>
                Pending {pendingCount} upload{pendingCount == 1 ? '' : 's'}{' '}
            </span>
            <span className={cls.CardSubtitle}>assign an already-uploaded file</span>
        </div>
    );
}

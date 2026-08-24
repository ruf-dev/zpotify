import cn from 'classnames';

import FolderIcon from '@/assets/icons/FolderIcon';
import ChevronRightIcon from '@/assets/icons/ChevronRightIcon.tsx';
import cls from '@/components/FolderGroupHeader/FolderGroupHeader.module.css';

interface FolderGroupHeaderProps {
    name: string;
    trackCount: number;
    progress: number;
    collapsed: boolean;
    onToggle: () => void;
}

export default function FolderGroupHeader(props: FolderGroupHeaderProps) {
    const trackCountLabel = props.trackCount === 1 ? '1 track' : `${props.trackCount} tracks`;

    return (
        <div
            className={cls.FolderGroupHeaderContainer}
            onClick={props.onToggle}
            style={{ '--upload-pct': String(props.progress / 100) } as React.CSSProperties}
        >
            <div className={cls.ProgressFill} />

            <span className={cn(cls.Chevron, !props.collapsed && cls.ChevronExpanded)}>
                <ChevronRightIcon />
            </span>

            <span className={cls.FolderIconWrapper}>
                <FolderIcon width={14} height={14} />
            </span>

            <span className={cls.FolderName}>{props.name}</span>

            <span className={cls.TrackCount}>{trackCountLabel}</span>
        </div>
    );
}

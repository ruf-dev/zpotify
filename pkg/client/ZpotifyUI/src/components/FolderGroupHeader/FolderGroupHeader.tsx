import cn from 'classnames';
import { Button } from '@vervstack/chures';

import FolderIcon from '@/assets/icons/FolderIcon';
import ChevronRightIcon from '@/assets/icons/ChevronRightIcon.tsx';
import Checkbox from '@/components/Checkbox/Checkbox';
import cls from '@/components/FolderGroupHeader/FolderGroupHeader.module.css';

interface FolderGroupHeaderProps {
    name: string;
    trackCount: number;
    progress: number;
    collapsed: boolean;
    onToggle: () => void;
    folderSelected?: boolean;
    onToggleSelectFolder?: (checked: boolean) => void;
    onCreatePlaylist?: () => void;
}

export default function FolderGroupHeader(props: FolderGroupHeaderProps) {
    const trackCountLabel = props.trackCount === 1 ? '1 track' : `${props.trackCount} tracks`;

    function handleSelectWrapperClick(e: React.MouseEvent) {
        e.stopPropagation();
    }

    function handleCreatePlaylistClick(e: React.MouseEvent) {
        e.stopPropagation();
        props.onCreatePlaylist?.();
    }

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

            {props.onToggleSelectFolder && (
                <span className={cls.SelectFolderWrapper} onClick={handleSelectWrapperClick}>
                    <Checkbox checked={props.folderSelected ?? false} onChange={props.onToggleSelectFolder} />
                </span>
            )}

            <span className={cls.FolderIconWrapper}>
                <FolderIcon width={14} height={14} />
            </span>

            <span className={cls.FolderName}>{props.name}</span>

            <span className={cls.TrackCount}>{trackCountLabel}</span>

            {props.onCreatePlaylist && (
                <Button variant="ghost" className={cls.CreatePlaylistButton} onClick={handleCreatePlaylistClick}>
                    Create playlist
                </Button>
            )}
        </div>
    );
}

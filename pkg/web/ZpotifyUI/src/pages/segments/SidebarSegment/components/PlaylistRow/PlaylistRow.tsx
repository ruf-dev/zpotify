import type { CSSProperties } from 'react';
import cn from 'classnames';
import cls from '@/pages/segments/SidebarSegment/components/PlaylistRow/PlaylistRow.module.css';

interface PlaylistRowProps {
    name: string;
    tracks: number;
    color: string;
    isCollapsed: boolean;
}

export default function PlaylistRow({ name, tracks, color, isCollapsed }: PlaylistRowProps) {
    return (
        <div className={cn(cls.PlaylistRow, isCollapsed && cls.PlaylistRowCollapsed)}>
            <div
                className={cls.PlaylistCover}
                style={{ '--playlist-color': color } as CSSProperties}
            />
            <div className={cn(cls.PlaylistInfoWrapper, isCollapsed && cls.PlaylistInfoWrapperHidden)}>
                <span className={cls.PlaylistName}>{name}</span>
                <span className={cls.PlaylistTracks}>{tracks} tracks</span>
            </div>
        </div>
    );
}

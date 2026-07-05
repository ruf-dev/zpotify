import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';
import { playlistPath } from '@/app/routing/paths.ts';
import cls from '@/pages/segments/SidebarSegment/components/PlaylistRow/PlaylistRow.module.css';

export interface PlaylistRowData {
    uuid: string;
    name: string;
    tracks: number;
    color: string;
    coverUrl?: string;
}

interface PlaylistRowProps extends PlaylistRowData {
    isCollapsed: boolean;
}

export default function PlaylistRow({ uuid, name, tracks, color, coverUrl, isCollapsed }: PlaylistRowProps) {
    const navigate = useNavigate();

    function handleClick() {
        navigate(playlistPath(uuid));
    }

    return (
        <div
            className={cn(cls.PlaylistRow, isCollapsed && cls.PlaylistRowCollapsed)}
            onClick={handleClick}
        >
            {coverUrl ? (
                <img src={coverUrl} alt={name} className={cls.PlaylistCover} />
            ) : (
                <div className={cls.PlaylistCover} style={{ '--playlist-color': color } as CSSProperties} />
            )}
            <div className={cn(cls.PlaylistInfoWrapper, isCollapsed && cls.PlaylistInfoWrapperHidden)}>
                <span className={cls.PlaylistName}>{name}</span>
                <span className={cls.PlaylistTracks}>{tracks} tracks</span>
            </div>
        </div>
    );
}

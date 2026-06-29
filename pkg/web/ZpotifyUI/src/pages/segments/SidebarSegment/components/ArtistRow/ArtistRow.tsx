import type { CSSProperties } from 'react';
import cn from 'classnames';
import cls from '@/pages/segments/SidebarSegment/components/ArtistRow/ArtistRow.module.css';

interface ArtistRowProps {
    name: string;
    tracks: number;
    seed: string;
    isCollapsed: boolean;
}

export default function ArtistRow({ name, tracks, seed, isCollapsed }: ArtistRowProps) {
    return (
        <div className={cn(cls.ArtistRow, isCollapsed && cls.ArtistRowCollapsed)}>
            <div
                className={cn(cls.ArtistAvatar, isCollapsed && cls.ArtistAvatarCollapsed)}
                style={{ '--seed': seed } as CSSProperties}
            >
                {name[0]}
            </div>
            <div className={cn(cls.ArtistInfoWrapper, isCollapsed && cls.ArtistInfoWrapperHidden)}>
                <span className={cls.ArtistName}>{name}</span>
                <span className={cls.ArtistTracks}>{tracks} tracks</span>
            </div>
        </div>
    );
}

import { useState } from 'react';
import cn from 'classnames';

import cls from '@/widgets/PlaylistsLibrarySegment/components/PlaylistCardWide/components/TrackRow/TrackRow.module.css';

interface TrackRowProps {
    index: number;
    title: string;
    artist: string;
}

export default function TrackRow({ index, title, artist }: TrackRowProps) {
    const [hovered, setHovered] = useState(false);

    function handleMouseEnter() {
        setHovered(true);
    }

    function handleMouseLeave() {
        setHovered(false);
    }

    return (
        <div
            className={cn(cls.TrackRow, { [cls.TrackRowHovered]: hovered })}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span className={cls.TrackNumber}>{index + 1}</span>
            <span className={cn(cls.TrackTitle, { [cls.TrackTitleHovered]: hovered })}>{title}</span>
            <span className={cls.TrackArtist}>{artist}</span>
        </div>
    );
}

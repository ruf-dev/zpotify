import { useState } from 'react';
import cn from 'classnames';

import GenerativeCover from '@/shared/ui/GenerativeCover.tsx';

import cls from '@/widgets/PlaylistsLibrarySegment/PlaylistCardWide.module.css';

interface PlaylistCardWideProps {
    uuid: string;
    name: string;
    songCount: number | undefined;
    description: string | undefined;
    seed: number;
    coverUrl?: string;
    tracks: Array<{ title: string; artist: string }>;
    onClick: () => void;
}

interface TrackRowProps {
    index: number;
    title: string;
    artist: string;
}

function TrackRow({ index, title, artist }: TrackRowProps) {
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

export default function PlaylistCardWide({
    name,
    songCount,
    description,
    seed,
    coverUrl,
    tracks,
    onClick,
}: PlaylistCardWideProps) {
    const subText = `${songCount ?? '?'} tracks${description ? ` · ${description}` : ''}`;

    return (
        <div className={cls.PlaylistCardWideContainer} onClick={onClick}>
            <div className={cls.CoverWrapper}>
                {coverUrl ? (
                    <img src={coverUrl} alt={name} className={cls.CoverImage} />
                ) : (
                    <GenerativeCover seed={seed} />
                )}
            </div>
            <div className={cls.Content}>
                <div className={cls.Header}>
                    <p className={cls.Name}>{name}</p>
                    <p className={cls.Sub}>{subText}</p>
                </div>
                <div className={cls.TrackList}>
                    {tracks.map(function renderTrack(track, idx) {
                        return <TrackRow key={idx} index={idx} title={track.title} artist={track.artist} />;
                    })}
                </div>
            </div>
        </div>
    );
}

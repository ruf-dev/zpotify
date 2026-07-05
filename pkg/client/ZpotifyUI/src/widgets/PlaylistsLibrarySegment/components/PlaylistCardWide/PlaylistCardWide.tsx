import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';

import { playlistPath } from '@/app/routing/paths.ts';
import GenerativeCover from '@/shared/ui/GenerativeCover.tsx';
import type { PlaylistCardWideProps } from '@/widgets/PlaylistsLibrarySegment/model.ts';

import cls from '@/widgets/PlaylistsLibrarySegment/components/PlaylistCardWide/PlaylistCardWide.module.css';

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
    uuid,
    name,
    songCount,
    description,
    seed,
    coverUrl,
    tracks,
}: PlaylistCardWideProps) {
    const navigate = useNavigate();
    const subText = `${songCount ?? '?'} tracks${description ? ` · ${description}` : ''}`;

    function handleClick() {
        navigate(playlistPath(uuid));
    }

    return (
        <div className={cls.PlaylistCardWideContainer} onClick={handleClick}>
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

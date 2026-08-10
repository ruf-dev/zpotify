import { type MouseEvent } from 'react';

import CoverWithFallback from '@/components/CoverWithFallback/CoverWithFallback.tsx';
import { formatDuration } from '@/shared/lib/time.ts';
import cls from '@/components/SongRow/SongRow.module.css';

export interface SongRowArtist {
    uuid?: string;
    name: string;
}

export interface SongRowProps {
    id: string;
    title: string;
    artists: SongRowArtist[];
    coverUrl?: string;
    durationSec: number;
    onPlay: () => void;
    onArtistClick: (artistUuid: string) => void;
}

export default function SongRow(props: SongRowProps) {
    function handleArtistClick(e: MouseEvent, artistUuid?: string) {
        e.stopPropagation();
        if (artistUuid) props.onArtistClick(artistUuid);
    }

    return (
        <div className={cls.SongRowContainer} onClick={props.onPlay}>
            <div className={cls.CoverWrapper}>
                <CoverWithFallback
                    coverUrl={props.coverUrl}
                    uuid={props.id}
                    name={props.title}
                    className={cls.CoverImage}
                />
            </div>
            <div className={cls.Info}>
                <p className={cls.Title}>{props.title}</p>
                <p className={cls.Artist}>
                    {props.artists.map((a, idx) => (
                        <span key={a.uuid ?? `${a.name}-${idx}`}>
                            {idx > 0 && ', '}
                            {a.uuid ? (
                                <span className={cls.ArtistLink} onClick={(e) => handleArtistClick(e, a.uuid)}>
                                    {a.name}
                                </span>
                            ) : (
                                a.name
                            )}
                        </span>
                    ))}
                </p>
            </div>
            <span className={cls.Duration}>{formatDuration(props.durationSec)}</span>
        </div>
    );
}

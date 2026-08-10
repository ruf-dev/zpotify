import { type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import CoverWithFallback from '@/components/CoverWithFallback/CoverWithFallback.tsx';
import { formatDuration } from '@/shared/lib/time.ts';
import type { FeedSongItem } from '@/widgets/FeedHomeSegment/model.ts';
import cls from '@/widgets/FeedHomeSegment/components/FeedSongRow/FeedSongRow.module.css';
import { artistPath } from '@/app/routing/paths.ts';

interface FeedSongRowProps extends FeedSongItem {
    onPlay: () => void;
}

export default function FeedSongRow({ id, title, artists, coverUrl, durationSec, onPlay }: FeedSongRowProps) {
    const navigate = useNavigate();

    function handleArtistClick(e: MouseEvent, artistUuid?: string) {
        e.stopPropagation();
        if (artistUuid) navigate(artistPath(artistUuid));
    }

    return (
        <div className={cls.FeedSongRowContainer} onClick={onPlay}>
            <div className={cls.CoverWrapper}>
                <CoverWithFallback coverUrl={coverUrl} uuid={id} name={title} className={cls.CoverImage} />
            </div>
            <div className={cls.Info}>
                <p className={cls.Title}>{title}</p>
                <p className={cls.Artist}>
                    {artists.map((a, idx) => (
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
            <span className={cls.Duration}>{formatDuration(durationSec)}</span>
        </div>
    );
}

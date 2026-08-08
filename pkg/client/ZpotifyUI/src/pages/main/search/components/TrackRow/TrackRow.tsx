import { type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import CoverWithFallback from '@/components/CoverWithFallback/CoverWithFallback.tsx';
import { formatDuration } from '@/shared/lib/time.ts';
import { artistPath } from '@/app/routing/paths.ts';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';
import type { SearchTrackResult } from '@/shared/api/SearchService.ts';
import cls from '@/pages/main/search/components/TrackRow/TrackRow.module.css';

export default function TrackRow({ uuid, title, artists, coverUrl, durationSec, filePath }: SearchTrackResult) {
    const navigate = useNavigate();
    const player = useAudioPlayer();

    function handleRowClick() {
        if (!filePath) return;
        const artistName = artists.map((a) => a.name).join(', ') || null;
        player.setSongInfo(title, artistName, coverUrl ?? null, artists);
        player.play(filePath);
    }

    function handleArtistClick(e: MouseEvent, artistUuid?: string) {
        e.stopPropagation();
        if (artistUuid) navigate(artistPath(artistUuid));
    }

    return (
        <div className={cls.TrackRowContainer} onClick={handleRowClick}>
            <div className={cls.CoverWrapper}>
                <CoverWithFallback coverUrl={coverUrl} uuid={uuid} name={title} className={cls.CoverImage} />
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

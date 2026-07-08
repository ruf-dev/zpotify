import { useNavigate } from 'react-router-dom';

import { playlistPath } from '@/app/routing/paths.ts';
import CoverWithFallback from '@/components/CoverWithFallback/CoverWithFallback.tsx';
import type { PlaylistCardWideProps } from '@/widgets/PlaylistsLibrarySegment/model.ts';
import cls from '@/widgets/PlaylistsLibrarySegment/components/PlaylistCardWide/PlaylistCardWide.module.css';
import TrackRow from '@/widgets/PlaylistsLibrarySegment/components/PlaylistCardWide/components/TrackRow/TrackRow';

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
                <CoverWithFallback coverUrl={coverUrl} seed={seed} name={name} />
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

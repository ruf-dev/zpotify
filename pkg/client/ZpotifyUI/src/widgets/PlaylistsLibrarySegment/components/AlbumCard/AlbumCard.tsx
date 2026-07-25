import { useNavigate } from 'react-router-dom';
import cn from 'classnames';

import { albumPath, artistPath } from '@/app/routing/paths.ts';
import CoverWithFallback from '@/components/CoverWithFallback/CoverWithFallback.tsx';
import type { AlbumCardProps } from '@/widgets/PlaylistsLibrarySegment/model.ts';
import cls from '@/widgets/PlaylistsLibrarySegment/components/AlbumCard/AlbumCard.module.css';

export default function AlbumCard({ uuid, name, artists, seed, coverUrl }: AlbumCardProps) {
    const navigate = useNavigate();

    function handleClick() {
        navigate(albumPath(uuid));
    }

    function handleArtistClick(e: React.MouseEvent, artistUuid: string) {
        e.stopPropagation();
        navigate(artistPath(artistUuid));
    }

    return (
        <div className={cn(cls.AlbumCardContainer)} onClick={handleClick}>
            <div className={cls.CoverWrapper}>
                <CoverWithFallback coverUrl={coverUrl} seed={seed} name={name} className={cls.CoverImage} />
            </div>
            <div className={cls.Footer}>
                <p className={cls.Name}>{name}</p>
                <p className={cls.Artist}>
                    {artists.map((a, idx) => (
                        <span key={a.uuid}>
                            {idx > 0 && ', '}
                            <span className={cls.ArtistLink} onClick={(e) => handleArtistClick(e, a.uuid)}>
                                {a.name}
                            </span>
                        </span>
                    ))}
                </p>
            </div>
        </div>
    );
}

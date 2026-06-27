import { useNavigate } from 'react-router-dom';
import cn from 'classnames';

import { albumPath } from '@/app/routing/paths.ts';
import GenerativeCover from '@/shared/ui/GenerativeCover.tsx';
import type { AlbumCardProps } from '@/widgets/PlaylistsLibrarySegment/model.ts';

import cls from '@/widgets/PlaylistsLibrarySegment/components/AlbumCard/AlbumCard.module.css';

export default function AlbumCard({ uuid, name, artistNames, seed, coverUrl }: AlbumCardProps) {
    const navigate = useNavigate();

    function handleClick() {
        navigate(albumPath(uuid));
    }

    function handleArtistClick(e: React.MouseEvent) {
        e.stopPropagation();
    }

    return (
        <div className={cn(cls.AlbumCardContainer)} onClick={handleClick}>
            <div className={cls.CoverWrapper}>
                {coverUrl ? (
                    <img src={coverUrl} alt={name} className={cls.CoverImage} />
                ) : (
                    <GenerativeCover seed={seed} />
                )}
            </div>
            <div className={cls.Footer}>
                <p className={cls.Name}>{name}</p>
                <p className={cls.Artist} onClick={handleArtistClick}>
                    {artistNames}
                </p>
            </div>
        </div>
    );
}

import cn from 'classnames';

import GenerativeCover from '@/shared/ui/GenerativeCover.tsx';

import cls from './AlbumCard.module.css';

interface AlbumCardProps {
    uuid: string;
    name: string;
    artistNames: string;
    seed: number;
    onClick: () => void;
    onArtistClick: (e: React.MouseEvent) => void;
}

export default function AlbumCard({ name, artistNames, seed, onClick, onArtistClick }: AlbumCardProps) {
    function handleArtistClick(e: React.MouseEvent) {
        e.stopPropagation();
        onArtistClick(e);
    }

    return (
        <div className={cn(cls.AlbumCardContainer)} onClick={onClick}>
            <div className={cls.CoverWrapper}>
                <GenerativeCover seed={seed} />
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

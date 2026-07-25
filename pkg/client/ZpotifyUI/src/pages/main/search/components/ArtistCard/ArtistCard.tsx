import { useNavigate } from 'react-router-dom';

import { artistPath } from '@/app/routing/paths.ts';
import CoverWithFallback from '@/components/CoverWithFallback/CoverWithFallback.tsx';
import cls from '@/pages/main/search/components/ArtistCard/ArtistCard.module.css';

interface ArtistCardProps {
    uuid: string;
    name: string;
    seed: number;
    trackCount?: number;
    coverUrl?: string;
}

export default function ArtistCard({ uuid, name, seed, trackCount, coverUrl }: ArtistCardProps) {
    const navigate = useNavigate();

    function handleClick() {
        navigate(artistPath(uuid));
    }

    return (
        <div className={cls.ArtistCardContainer} onClick={handleClick}>
            <div className={cls.CoverWrapper}>
                <CoverWithFallback coverUrl={coverUrl} seed={seed} name={name} className={cls.CoverImage} />
            </div>
            <div className={cls.Footer}>
                <p className={cls.Name}>{name}</p>
                {trackCount !== undefined && <p className={cls.Sub}>{trackCount} tracks</p>}
            </div>
        </div>
    );
}

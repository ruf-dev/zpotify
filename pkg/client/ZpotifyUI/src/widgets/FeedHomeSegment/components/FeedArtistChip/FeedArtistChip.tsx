import { useNavigate } from 'react-router-dom';

import CoverWithFallback from '@/components/CoverWithFallback/CoverWithFallback.tsx';
import type { FeedArtistItem } from '@/widgets/FeedHomeSegment/model.ts';
import cls from '@/widgets/FeedHomeSegment/components/FeedArtistChip/FeedArtistChip.module.css';
import { artistPath } from '@/app/routing/paths.ts';

export default function FeedArtistChip({ uuid, name, seed }: FeedArtistItem) {
    const navigate = useNavigate();

    function handleClick() {
        if (uuid) navigate(artistPath(uuid));
    }

    return (
        <div className={cls.FeedArtistChipContainer} onClick={handleClick}>
            <div className={cls.CoverWrapper}>
                <CoverWithFallback seed={seed} name={name} className={cls.CoverImage} />
            </div>
            <p className={cls.Name}>{name}</p>
        </div>
    );
}

import CoverWithFallback from '@/components/CoverWithFallback/CoverWithFallback.tsx';
import type { FeedArtistItem } from '@/widgets/FeedHomeSegment/model.ts';
import cls from '@/widgets/FeedHomeSegment/components/FeedArtistChip/FeedArtistChip.module.css';

export default function FeedArtistChip({ name, seed }: FeedArtistItem) {
    return (
        <div className={cls.FeedArtistChipContainer}>
            <div className={cls.CoverWrapper}>
                <CoverWithFallback seed={seed} name={name} className={cls.CoverImage} />
            </div>
            <p className={cls.Name}>{name}</p>
        </div>
    );
}

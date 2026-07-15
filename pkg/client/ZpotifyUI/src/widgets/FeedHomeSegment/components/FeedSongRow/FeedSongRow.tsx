import CoverWithFallback from '@/components/CoverWithFallback/CoverWithFallback.tsx';
import { formatDuration } from '@/shared/lib/time.ts';
import type { FeedSongItem } from '@/widgets/FeedHomeSegment/model.ts';
import cls from '@/widgets/FeedHomeSegment/components/FeedSongRow/FeedSongRow.module.css';

export default function FeedSongRow({ id, title, artistNames, coverUrl, durationSec }: FeedSongItem) {
    return (
        <div className={cls.FeedSongRowContainer}>
            <div className={cls.CoverWrapper}>
                <CoverWithFallback coverUrl={coverUrl} uuid={id} name={title} className={cls.CoverImage} />
            </div>
            <div className={cls.Info}>
                <p className={cls.Title}>{title}</p>
                <p className={cls.Artist}>{artistNames}</p>
            </div>
            <span className={cls.Duration}>{formatDuration(durationSec)}</span>
        </div>
    );
}

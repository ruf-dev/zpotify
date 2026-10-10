import cn from 'classnames';

import cls from '@/widgets/PlaylistScreen/components/TrackRowSkeleton/TrackRowSkeleton.module.css';

interface Props {
    count?: number;
}

const DEFAULT_ROW_COUNT = 3;

export default function TrackRowSkeleton({ count = DEFAULT_ROW_COUNT }: Props) {
    const rows = Array.from({ length: count }, (_, idx) => idx);

    return (
        <div className={cls.TrackRowSkeletonContainer} aria-hidden="true">
            {rows.map((idx) => (
                <div key={idx} className={cls.Row}>
                    <div className={cls.NumCell}>
                        <div className={cn(cls.ShimmerBlock, cls.NumBlock)} />
                    </div>
                    <div className={cls.TitleCell}>
                        <div className={cn(cls.ShimmerBlock, cls.TitleBlock)} />
                        <div className={cn(cls.ShimmerBlock, cls.ArtistBlock)} />
                    </div>
                    <div className={cls.DurationCell}>
                        <div className={cn(cls.ShimmerBlock, cls.DurationBlock)} />
                    </div>
                </div>
            ))}
        </div>
    );
}

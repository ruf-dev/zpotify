import cn from 'classnames';

import cls from '@/widgets/FeedHomeSegment/FeedHomeSegment.module.css';

export default function FeedHomeSegmentSkeleton() {
    return (
        <div className={cls.FeedHomeSegmentContainer}>
            <div className={cls.SkeletonGroup}>
                <div className={cn(cls.ShimmerBlock, cls.ShimmerHeading)} />
                <div className={cls.ShimmerRow}>
                    <div className={cn(cls.ShimmerBlock, cls.ShimmerBlockLg)} />
                    <div className={cn(cls.ShimmerBlock, cls.ShimmerBlockLg)} />
                    <div className={cn(cls.ShimmerBlock, cls.ShimmerBlockLg)} />
                </div>
            </div>
            <div className={cls.SkeletonGroup}>
                <div className={cn(cls.ShimmerBlock, cls.ShimmerHeading)} />
                <div className={cls.ShimmerRow}>
                    <div className={cn(cls.ShimmerBlock, cls.ShimmerBlockLg)} />
                    <div className={cn(cls.ShimmerBlock, cls.ShimmerBlockLg)} />
                </div>
            </div>
        </div>
    );
}

import cn from 'classnames';

import cls from '@/widgets/PlaylistsLibrarySegment/components/PlaylistCardWide/PlaylistCardWide.module.css';
import skeletonCls from '@/widgets/PlaylistsLibrarySegment/Skeleton.module.css';

export default function PlaylistCardWideSkeleton() {
    return (
        <div className={cn(cls.PlaylistCardWideContainer, skeletonCls.CardSkeleton)}>
            <div className={cls.CoverWrapper}>
                <div className={cn(skeletonCls.ShimmerBlock, skeletonCls.Cover)} />
            </div>
            <div className={cls.Content}>
                <div className={cls.Header}>
                    <div className={cn(skeletonCls.ShimmerBlock, skeletonCls.LineTitle)} />
                    <div className={cn(skeletonCls.ShimmerBlock, skeletonCls.LineSub)} />
                </div>
                <div className={cls.TrackList}>
                    <div className={cn(skeletonCls.ShimmerBlock, skeletonCls.LineTrack)} />
                    <div className={cn(skeletonCls.ShimmerBlock, skeletonCls.LineTrack)} />
                    <div className={cn(skeletonCls.ShimmerBlock, skeletonCls.LineTrack)} />
                </div>
            </div>
        </div>
    );
}

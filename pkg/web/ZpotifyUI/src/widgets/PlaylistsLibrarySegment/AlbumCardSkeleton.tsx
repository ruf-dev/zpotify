import cn from 'classnames';

import cls from '@/widgets/PlaylistsLibrarySegment/AlbumCard.module.css';
import skeletonCls from '@/widgets/PlaylistsLibrarySegment/Skeleton.module.css';

export default function AlbumCardSkeleton() {
    return (
        <div className={cn(cls.AlbumCardContainer, skeletonCls.CardSkeleton)}>
            <div className={cls.CoverWrapper}>
                <div className={cn(skeletonCls.ShimmerBlock, skeletonCls.Cover)} />
            </div>
            <div className={cls.Footer}>
                <div className={cn(skeletonCls.ShimmerBlock, skeletonCls.LinePrimary)} />
                <div className={cn(skeletonCls.ShimmerBlock, skeletonCls.LineSecondary)} />
            </div>
        </div>
    );
}

import cn from 'classnames';

import cls from '@/pages/segments/SidebarSegment/components/PlaylistRowSkeleton/PlaylistRowSkeleton.module.css';

interface Props {
    isCollapsed: boolean;
}

export default function PlaylistRowSkeleton({ isCollapsed }: Props) {
    return (
        <div className={cn(cls.PlaylistRowSkeletonContainer, isCollapsed && cls.Collapsed)}>
            <div className={cn(cls.ShimmerBlock, cls.Cover)} />
            <div className={cn(cls.InfoWrapper, isCollapsed && cls.InfoWrapperHidden)}>
                <div className={cn(cls.ShimmerBlock, cls.Name)} />
                <div className={cn(cls.ShimmerBlock, cls.Tracks)} />
            </div>
        </div>
    );
}

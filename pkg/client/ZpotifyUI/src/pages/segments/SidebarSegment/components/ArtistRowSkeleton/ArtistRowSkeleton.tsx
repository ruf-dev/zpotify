import cn from 'classnames';

import cls from '@/pages/segments/SidebarSegment/components/ArtistRowSkeleton/ArtistRowSkeleton.module.css';

interface Props {
    isCollapsed: boolean;
}

export default function ArtistRowSkeleton({ isCollapsed }: Props) {
    return (
        <div className={cn(cls.ArtistRowSkeletonContainer, isCollapsed && cls.Collapsed)}>
            <div className={cn(cls.AvatarSkeleton, isCollapsed && cls.AvatarCollapsed)} />
            <div className={cn(cls.InfoWrapper, isCollapsed && cls.InfoWrapperHidden)}>
                <div className={cn(cls.ShimmerBlock, cls.Name)} />
            </div>
        </div>
    );
}

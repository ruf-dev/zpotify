import cn from 'classnames';

import cls from '@/widgets/User/UserWidget.module.css';

interface UserWidgetSkeletonProps {
    showUsername?: boolean;
}

export default function UserWidgetSkeleton({ showUsername = true }: UserWidgetSkeletonProps) {
    return (
        <div className={cls.UserWidget}>
            <div className={cn(cls.Pill, !showUsername && cls.PillCompact)}>
                <div className={cn(cls.AvatarContainer, cls.ShimmerBlock)} />
                {showUsername && <div className={cn(cls.ShimmerBlock, cls.SkeletonUsername)} />}
            </div>
        </div>
    );
}

import cn from 'classnames';

import cls from '@/widgets/NotificationBell/NotificationBellWidget.module.css';

const SKELETON_ROW_COUNT = 3;

export default function NotificationBellSkeleton() {
    return (
        <>
            {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
                <div key={index} className={cls.SkeletonRowContainer}>
                    <div className={cls.SkeletonBody}>
                        <div className={cn(cls.ShimmerBlock, cls.SkeletonTitle)} />
                        <div className={cn(cls.ShimmerBlock, cls.SkeletonDate)} />
                    </div>
                </div>
            ))}
        </>
    );
}

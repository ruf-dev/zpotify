import cn from 'classnames';

import cls from '@/dialogs/FileList/FilesList.module.css';

const SKELETON_ROW_COUNT = 5;

export default function FilesListSkeleton() {
    return (
        <>
            {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
                <div key={index} className={cls.FileItemSkeleton}>
                    <div className={cn(cls.ShimmerBlock, cls.SkeletonName)} />
                    <div className={cn(cls.ShimmerBlock, cls.SkeletonPath)} />
                </div>
            ))}
        </>
    );
}

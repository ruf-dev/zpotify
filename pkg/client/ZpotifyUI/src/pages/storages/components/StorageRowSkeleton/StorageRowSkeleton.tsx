import cls from '@/pages/storages/components/StorageRowSkeleton/StorageRowSkeleton.module.css';

export default function StorageRowSkeleton() {
    return (
        <li className={cls.StorageRowSkeletonContainer}>
            <div className={cls.Info}>
                <div className={cls.NameBlock} />
                <div className={cls.MetaBlock} />
            </div>
            <div className={cls.ActionsBlock} />
        </li>
    );
}

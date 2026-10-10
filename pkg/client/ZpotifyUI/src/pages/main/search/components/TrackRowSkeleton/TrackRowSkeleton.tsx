import cls from '@/pages/main/search/components/TrackRowSkeleton/TrackRowSkeleton.module.css';

export default function TrackRowSkeleton() {
    return (
        <div className={cls.TrackRowSkeletonContainer}>
            <div className={cls.Cover} />
            <div className={cls.Info}>
                <div className={cls.Title} />
                <div className={cls.Artist} />
            </div>
            <div className={cls.Duration} />
        </div>
    );
}

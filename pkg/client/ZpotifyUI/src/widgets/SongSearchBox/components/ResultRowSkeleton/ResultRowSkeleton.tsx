import cls from '@/widgets/SongSearchBox/components/ResultRowSkeleton/ResultRowSkeleton.module.css';

export default function ResultRowSkeleton() {
    return (
        <div className={cls.ResultRowSkeletonContainer}>
            <div className={cls.Cover} />
            <div className={cls.Text}>
                <div className={cls.Title} />
                <div className={cls.Artists} />
            </div>
            <div className={cls.Duration} />
            <div className={cls.AddIcon} />
        </div>
    );
}

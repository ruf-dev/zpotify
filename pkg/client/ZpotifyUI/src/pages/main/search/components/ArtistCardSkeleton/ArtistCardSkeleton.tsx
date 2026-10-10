import cls from '@/pages/main/search/components/ArtistCardSkeleton/ArtistCardSkeleton.module.css';

export default function ArtistCardSkeleton() {
    return (
        <div className={cls.ArtistCardSkeletonContainer}>
            <div className={cls.Avatar} />
            <div className={cls.Name} />
            <div className={cls.Sub} />
        </div>
    );
}

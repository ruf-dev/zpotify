import cls from '@/widgets/ArtistScreen/ArtistScreenWidget.module.css';
import skeletonCls from '@/widgets/ArtistScreen/screens/SkeletonLoadScreen/SkeletonLoadScreen.module.css';

export default function SkeletonLoadScreen() {
    return (
        <div className={cls.ArtistScreenContainer}>
            <div className={skeletonCls.HeroSkeleton} />
            <div className={cls.Separator} />
            <div className={skeletonCls.RowsSkeleton} />
        </div>
    );
}

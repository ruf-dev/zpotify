import cls from '@/widgets/PlaylistScreen/PlaylistScreenWidget.module.css';
import skeletonCls from '@/widgets/PlaylistScreen/screens/SkeletonLoadScreen/SkeletonLoadScreen.module.css';

export default function SkeletonLoadScreen() {
    return (
        <div className={cls.PlaylistScreenContainer}>
            <div className={cls.AmbientWash} />
            <div className={cls.Body}>
                <div className={skeletonCls.SidebarSkeleton} />
                <div className={skeletonCls.MainContentSkeleton} />
            </div>
        </div>
    );
}

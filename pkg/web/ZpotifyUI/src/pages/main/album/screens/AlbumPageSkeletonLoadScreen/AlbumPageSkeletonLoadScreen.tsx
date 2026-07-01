import cls from '@/pages/main/album/AlbumPage.module.css';
import skeletonCls from '@/pages/main/album/screens/AlbumPageSkeletonLoadScreen/AlbumPageSkeletonLoadScreen.module.css';

export default function AlbumPageSkeletonLoadScreen() {
    return (
        <div className={cls.AlbumPageContainer}>
            <div className={cls.AmbientWash} />
            <div className={cls.Body}>
                <div className={skeletonCls.SidebarSkeleton} />
                <div className={skeletonCls.MainContentSkeleton} />
            </div>
        </div>
    );
}

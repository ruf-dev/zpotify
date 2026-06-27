import cls from '@/widgets/PlaylistsLibrarySegment/screens/LibraryGridScreen/LibraryGridScreen.module.css';
import AlbumCardSkeleton from '@/widgets/PlaylistsLibrarySegment/components/AlbumCard/AlbumCardSkeleton.tsx';
import PlaylistCardWideSkeleton from '@/widgets/PlaylistsLibrarySegment/components/PlaylistCardWide/PlaylistCardWideSkeleton.tsx';

export default function LibraryGridScreenSkeleton() {
    return (
        <div className={cls.Grid}>
            <PlaylistCardWideSkeleton />
            <AlbumCardSkeleton />
            <AlbumCardSkeleton />
            <PlaylistCardWideSkeleton />
            <AlbumCardSkeleton />
            <AlbumCardSkeleton />
        </div>
    );
}

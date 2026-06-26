import cls from '@/widgets/PlaylistsLibrarySegment/PlaylistsLibrarySegment.module.css';
import AlbumCardSkeleton from '@/widgets/PlaylistsLibrarySegment/AlbumCardSkeleton.tsx';
import PlaylistCardWideSkeleton from '@/widgets/PlaylistsLibrarySegment/PlaylistCardWideSkeleton.tsx';

export default function PlaylistsLibrarySegmentSkeleton() {
    return (
        <div className={cls.PlaylistsLibrarySegmentContainer}>
            <div className={cls.Grid}>
                <PlaylistCardWideSkeleton />
                <AlbumCardSkeleton />
                <AlbumCardSkeleton />
                <PlaylistCardWideSkeleton />
                <AlbumCardSkeleton />
                <AlbumCardSkeleton />
            </div>
        </div>
    );
}

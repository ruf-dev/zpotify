import type { SearchFilters } from '@/shared/api/SearchService.ts';
import TrackRowSkeleton from '@/pages/main/search/components/TrackRowSkeleton/TrackRowSkeleton.tsx';
import ArtistCardSkeleton from '@/pages/main/search/components/ArtistCardSkeleton/ArtistCardSkeleton.tsx';
import AlbumCardSkeleton from '@/pages/main/search/components/AlbumCardSkeleton/AlbumCardSkeleton.tsx';
import PlaylistCardSkeleton from '@/pages/main/search/components/PlaylistCardSkeleton/PlaylistCardSkeleton.tsx';
import cls from '@/pages/main/search/components/SearchResultsSkeleton/SearchResultsSkeleton.module.css';

interface Props {
    filters: SearchFilters;
}

const TRACK_COUNT = 5;
const ARTIST_COUNT = 6;
const ALBUM_COUNT = 6;
const PLAYLIST_COUNT = 2;

function range(count: number): number[] {
    return Array.from({ length: count }, (_, idx) => idx);
}

export default function SearchResultsSkeleton({ filters }: Props) {
    return (
        <div className={cls.SearchResultsSkeletonContainer}>
            {filters.tracks && (
                <div className={cls.Section}>
                    <div className={cls.Label} />
                    <div className={cls.TrackList}>
                        {range(TRACK_COUNT).map((idx) => (
                            <TrackRowSkeleton key={idx} />
                        ))}
                    </div>
                </div>
            )}
            {filters.artists && (
                <div className={cls.Section}>
                    <div className={cls.Label} />
                    <div className={cls.ArtistGrid}>
                        {range(ARTIST_COUNT).map((idx) => (
                            <ArtistCardSkeleton key={idx} />
                        ))}
                    </div>
                </div>
            )}
            {filters.albums && (
                <div className={cls.Section}>
                    <div className={cls.Label} />
                    <div className={cls.AlbumGrid}>
                        {range(ALBUM_COUNT).map((idx) => (
                            <AlbumCardSkeleton key={idx} />
                        ))}
                    </div>
                </div>
            )}
            {filters.playlists && (
                <div className={cls.Section}>
                    <div className={cls.Label} />
                    <div className={cls.PlaylistGrid}>
                        {range(PLAYLIST_COUNT).map((idx) => (
                            <PlaylistCardSkeleton key={idx} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

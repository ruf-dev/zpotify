import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';

import { useLikedArtists } from '@/entities/artist/useLikedArtists';
import ArtistRow from '@/pages/segments/SidebarSegment/components/ArtistRow/ArtistRow';
import ArtistRowSkeleton from '@/pages/segments/SidebarSegment/components/ArtistRowSkeleton/ArtistRowSkeleton';
import cls from '@/pages/segments/SidebarSegment/Widget/SidebarArtistsWidget/SidebarArtistsWidget.module.css';

const SKELETON_ROW_COUNT = 4;

function uuidToHslSeed(uuid: string): string {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) hash = (hash * 31 + uuid.charCodeAt(i)) | 0;
    return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`;
}

interface SidebarArtistsWidgetProps {
    isCollapsed: boolean;
}

export default function SidebarArtistsWidget({ isCollapsed }: SidebarArtistsWidgetProps) {
    const artists = useLikedArtists((s) => s.likedArtists);
    const loaded = useLikedArtists((s) => s.loaded);
    const fetchLikedArtists = useLikedArtists((s) => s.fetchLikedArtists);
    const [isFetchSettled, setIsFetchSettled] = useState(loaded);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLikedArtists()
            .catch(() => {})
            .finally(() => setIsFetchSettled(true));
    }, [fetchLikedArtists]);

    function handleSearchClick() {
        void navigate('/search');
    }

    return (
        <div className={cls.SidebarArtistsWidgetContainer}>
            <span className={cn(cls.SectionLabel, isCollapsed && cls.SectionLabelHidden)}>Your Artists</span>
            {!isFetchSettled &&
                Array.from({ length: SKELETON_ROW_COUNT }).map((_, idx) => (
                    <ArtistRowSkeleton key={idx} isCollapsed={isCollapsed} />
                ))}
            {loaded && artists.length === 0 && (
                <div className={cn(cls.EmptyState, isCollapsed && cls.EmptyStateHidden)}>
                    <span className={cls.EmptyStateText}>No liked artists yet</span>
                    <button className={cls.SearchButton} onClick={handleSearchClick}>
                        Search artists
                    </button>
                </div>
            )}
            {artists.map((artist) => (
                <ArtistRow
                    key={artist.uuid}
                    uuid={artist.uuid ?? ''}
                    name={artist.name ?? ''}
                    seed={uuidToHslSeed(artist.uuid ?? '')}
                    isCollapsed={isCollapsed}
                />
            ))}
        </div>
    );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';

import { useLikedArtists } from '@/entities/artist/useLikedArtists';
import ArtistRow from '@/pages/segments/SidebarSegment/components/ArtistRow/ArtistRow';
import cls from '@/pages/segments/SidebarSegment/Widget/SidebarArtistsWidget/SidebarArtistsWidget.module.css';

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
    const navigate = useNavigate();

    useEffect(() => {
        fetchLikedArtists().catch(() => {});
    }, [fetchLikedArtists]);

    function handleSearchClick() {
        void navigate('/search');
    }

    return (
        <div className={cls.SidebarArtistsWidgetContainer}>
            <span className={cn(cls.SectionLabel, isCollapsed && cls.SectionLabelHidden)}>Your Artists</span>
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
                    name={artist.name ?? ''}
                    seed={uuidToHslSeed(artist.uuid ?? '')}
                    isCollapsed={isCollapsed}
                />
            ))}
        </div>
    );
}

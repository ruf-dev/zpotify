import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';
import type { ArtistBase } from '@/app/api/zpotify';
import { artistsService } from '@/shared/api/ArtistsService';
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
    const [artists, setArtists] = useState<ArtistBase[]>([]);
    const [loaded, setLoaded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        artistsService
            .ListArtist('', 0, 50)
            .then((resp) => {
                setArtists(resp.artists ?? []);
                setLoaded(true);
            })
            .catch(() => {
                setLoaded(true);
            });
    }, []);

    function handleSearchClick() {
        void navigate('/search');
    }

    return (
        <div className={cls.SidebarArtistsWidgetContainer}>
            <span className={cn(cls.SectionLabel, isCollapsed && cls.SectionLabelHidden)}>
                Your Artists
            </span>
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

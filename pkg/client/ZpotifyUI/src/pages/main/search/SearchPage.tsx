import { useNavigate } from 'react-router-dom';

import AlbumCard from '@/widgets/PlaylistsLibrarySegment/components/AlbumCard/AlbumCard.tsx';
import PlaylistCardWide from '@/widgets/PlaylistsLibrarySegment/components/PlaylistCardWide/PlaylistCardWide.tsx';
import FilterChips from '@/pages/main/search/components/FilterChips/FilterChips.tsx';
import SectionLabel from '@/pages/main/search/components/SectionLabel/SectionLabel.tsx';
import EmptyState from '@/pages/main/search/components/EmptyState/EmptyState.tsx';
import ArtistCard from '@/pages/main/search/components/ArtistCard/ArtistCard.tsx';
import { useSearchPage } from '@/pages/main/search/useSearchPage.ts';
import { Path } from '@/app/routing/paths.ts';
import BackButton from '@/shared/ui/BackButton.tsx';
import cls from '@/pages/main/search/SearchPage.module.css';

export default function SearchPage() {
    const page = useSearchPage();
    const navigate = useNavigate();

    function handleBack() {
        navigate(Path.HomePage);
    }

    function renderArtists() {
        if (!page.filters.artists || page.visibleArtists.length === 0) return null;
        return (
            <div className={cls.Section}>
                <SectionLabel label="Artists" count={page.visibleArtists.length} />
                <div className={cls.ArtistGrid}>
                    {page.visibleArtists.map((artist) => (
                        <ArtistCard key={artist.uuid} {...artist} />
                    ))}
                </div>
            </div>
        );
    }

    function renderAlbums() {
        if (!page.filters.albums || page.visibleAlbums.length === 0) return null;
        return (
            <div className={cls.Section}>
                <SectionLabel label="Albums" count={page.visibleAlbums.length} />
                <div className={cls.AlbumGrid}>
                    {page.visibleAlbums.map((album) => (
                        <AlbumCard key={album.uuid} {...album} />
                    ))}
                </div>
            </div>
        );
    }

    function renderPlaylists() {
        if (!page.filters.playlists || page.visiblePlaylists.length === 0) return null;
        return (
            <div className={cls.Section}>
                <SectionLabel label="Playlists" count={page.visiblePlaylists.length} />
                <div className={cls.PlaylistGrid}>
                    {page.visiblePlaylists.map((playlist) => (
                        <PlaylistCardWide key={playlist.uuid} {...playlist} />
                    ))}
                </div>
            </div>
        );
    }

    function renderResults() {
        if (page.query.trim().length > 0 && page.totalResults === 0) {
            return <EmptyState query={page.query.trim()} />;
        }

        return (
            <>
                {renderArtists()}
                {renderAlbums()}
                {renderPlaylists()}
            </>
        );
    }

    return (
        <div className={cls.SearchPageContainer}>
            <div className={cls.HeaderRow}>
                <BackButton onClick={handleBack} />
            </div>
            <FilterChips active={page.filters} onToggle={page.toggleFilter} />
            <div className={cls.ResultsWrapper}>{renderResults()}</div>
        </div>
    );
}

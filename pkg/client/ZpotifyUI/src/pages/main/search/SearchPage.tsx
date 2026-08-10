import { useNavigate } from 'react-router-dom';

import AlbumCard from '@/widgets/PlaylistsLibrarySegment/components/AlbumCard/AlbumCard.tsx';
import PlaylistCardWide from '@/widgets/PlaylistsLibrarySegment/components/PlaylistCardWide/PlaylistCardWide.tsx';
import FilterChips from '@/pages/main/search/components/FilterChips/FilterChips.tsx';
import SectionLabel from '@/pages/main/search/components/SectionLabel/SectionLabel.tsx';
import EmptyState from '@/pages/main/search/components/EmptyState/EmptyState.tsx';
import ArtistCard from '@/pages/main/search/components/ArtistCard/ArtistCard.tsx';
import SongRow from '@/components/SongRow/SongRow.tsx';
import { useSearchPage } from '@/pages/main/search/useSearchPage.ts';
import type { SearchTrackResult } from '@/shared/api/SearchService.ts';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';
import { Path, artistPath } from '@/app/routing/paths.ts';
import BackButton from '@/shared/ui/BackButton.tsx';
import cls from '@/pages/main/search/SearchPage.module.css';

export default function SearchPage() {
    const page = useSearchPage();
    const navigate = useNavigate();
    const player = useAudioPlayer();

    function handleBack() {
        navigate(Path.HomePage);
    }

    function handlePlayTrack(track: SearchTrackResult) {
        if (!track.filePath) return;
        const artistName = track.artists.map((a) => a.name).join(', ') || null;
        player.setSongInfo(track.title, artistName, track.coverUrl ?? null, track.artists);
        player.play(track.filePath);
    }

    function handleArtistClick(artistUuid: string) {
        navigate(artistPath(artistUuid));
    }

    function renderTracks() {
        if (!page.filters.tracks || page.visibleTracks.length === 0) return null;
        return (
            <div className={cls.Section}>
                <SectionLabel label="Tracks" count={page.visibleTracks.length} />
                <div className={cls.TrackList}>
                    {page.visibleTracks.map((track) => (
                        <SongRow
                            key={track.uuid}
                            id={track.uuid}
                            title={track.title}
                            artists={track.artists}
                            coverUrl={track.coverUrl}
                            durationSec={track.durationSec}
                            onPlay={() => handlePlayTrack(track)}
                            onArtistClick={handleArtistClick}
                        />
                    ))}
                </div>
            </div>
        );
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
                {renderTracks()}
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

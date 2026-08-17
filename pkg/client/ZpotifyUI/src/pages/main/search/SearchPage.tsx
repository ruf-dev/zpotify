import { useNavigate } from 'react-router-dom';

import AlbumCard from '@/widgets/PlaylistsLibrarySegment/components/AlbumCard/AlbumCard.tsx';
import PlaylistCardWide from '@/widgets/PlaylistsLibrarySegment/components/PlaylistCardWide/PlaylistCardWide.tsx';
import FilterChips from '@/pages/main/search/components/FilterChips/FilterChips.tsx';
import SectionLabel from '@/pages/main/search/components/SectionLabel/SectionLabel.tsx';
import EmptyState from '@/pages/main/search/components/EmptyState/EmptyState.tsx';
import ArtistCard from '@/pages/main/search/components/ArtistCard/ArtistCard.tsx';
import MobileSearchInput from '@/pages/main/search/components/MobileSearchInput/MobileSearchInput.tsx';
import SongRow from '@/components/SongRow/SongRow.tsx';
import { useSearchPage } from '@/pages/main/search/useSearchPage.ts';
import type { SearchArtistResult, SearchTrackResult } from '@/shared/api/SearchService.ts';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';
import { Path, artistPath, albumPath, playlistPath } from '@/app/routing/paths.ts';
import { useSearchHistory } from '@/entities/search/useSearchHistory.ts';
import BackButton from '@/shared/ui/BackButton.tsx';
import cls from '@/pages/main/search/SearchPage.module.css';

export default function SearchPage() {
    const page = useSearchPage();
    const navigate = useNavigate();
    const player = useAudioPlayer();
    const recordFinding = useSearchHistory((s) => s.recordFinding);

    function handleBack() {
        navigate(Path.HomePage);
    }

    function handlePlayTrack(track: SearchTrackResult) {
        const containerPath = resolveContainerPath(track);
        const container = track.containerPlaylist;
        if (containerPath && container) {
            recordFinding(
                page.query,
                container.isAlbum ? 'album' : 'playlist',
                container.uuid,
                container.name,
                track.coverUrl ?? '',
            );
            navigate(containerPath);
            return;
        }
        if (!track.filePath) return;
        // TODO: standalone singles just play directly for now — give them their own page/flow later.
        const artistName = track.artists.map((a) => a.name).join(', ') || null;
        player.setSongInfo(track.title, artistName, track.coverUrl ?? null, track.artists);
        player.play(track.filePath);
    }

    function handleArtistClick(artistUuid: string) {
        const artist = findArtistInResults(artistUuid);
        recordFinding(page.query, 'artist', artistUuid, artist?.name ?? '', artist?.coverUrl ?? '');
        navigate(artistPath(artistUuid));
    }

    function handleArtistCardClick(artist: SearchArtistResult) {
        recordFinding(page.query, 'artist', artist.uuid, artist.name, artist.coverUrl ?? '');
    }

    function handleAlbumCardClick(uuid: string, name: string, coverUrl?: string) {
        recordFinding(page.query, 'album', uuid, name, coverUrl ?? '');
    }

    function handlePlaylistCardClick(uuid: string, name: string, coverUrl?: string) {
        recordFinding(page.query, 'playlist', uuid, name, coverUrl ?? '');
    }

    function findArtistInResults(artistUuid: string): { name: string; coverUrl?: string } | null {
        const fromArtistResults = page.visibleArtists.find((a) => a.uuid === artistUuid);
        if (fromArtistResults) return fromArtistResults;
        for (const track of page.visibleTracks) {
            const match = track.artists.find((a) => a.uuid === artistUuid);
            if (match) return { name: match.name };
        }
        return null;
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
                        <div
                            key={artist.uuid}
                            className={cls.FindingCaptureWrapper}
                            onClick={() => handleArtistCardClick(artist)}
                        >
                            <ArtistCard {...artist} />
                        </div>
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
                        <div
                            key={album.uuid}
                            className={cls.FindingCaptureWrapper}
                            onClick={() => handleAlbumCardClick(album.uuid, album.name, album.coverUrl)}
                        >
                            <AlbumCard {...album} />
                        </div>
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
                        <div
                            key={playlist.uuid}
                            className={cls.FindingCaptureWrapper}
                            onClick={() => handlePlaylistCardClick(playlist.uuid, playlist.name, playlist.coverUrl)}
                        >
                            <PlaylistCardWide {...playlist} />
                        </div>
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
                <MobileSearchInput />
            </div>
            <FilterChips active={page.filters} onToggle={page.toggleFilter} />
            <div className={cls.ResultsWrapper}>{renderResults()}</div>
        </div>
    );
}

function resolveContainerPath(track: SearchTrackResult): string | null {
    const container = track.containerPlaylist;
    if (!container) return null;
    return container.isAlbum ? albumPath(container.uuid, track.uuid) : playlistPath(container.uuid, track.uuid);
}

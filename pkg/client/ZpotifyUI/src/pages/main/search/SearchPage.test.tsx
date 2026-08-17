import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import type { SearchTrackResult } from '@/shared/api/SearchService.ts';
import SearchPage from '@/pages/main/search/SearchPage.tsx';

const navigateSpy = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => navigateSpy,
}));

const playSpy = vi.fn();
const setSongInfoSpy = vi.fn();
vi.mock('@/widgets/MusicPlayer/usePlayer.ts', () => ({
    default: () => ({ play: playSpy, setSongInfo: setSongInfoSpy }),
}));

const recordFindingSpy = vi.fn();
vi.mock('@/entities/search/useSearchHistory.ts', () => ({
    useSearchHistory: (selector: (s: { recordFinding: typeof recordFindingSpy }) => unknown) =>
        selector({ recordFinding: recordFindingSpy }),
}));

// MobileSearchInput mounts SearchHistoryDropdown, which needs matchMedia/portal wiring that's
// out of scope for these SearchPage-level tests — see SearchHistoryDropdown.test.tsx for that behavior.
vi.mock('@/pages/main/search/components/MobileSearchInput/MobileSearchInput.tsx', () => ({
    default: () => null,
}));

let visibleTracks: SearchTrackResult[] = [];
vi.mock('@/pages/main/search/useSearchPage.ts', () => ({
    useSearchPage: () => ({
        query: 'test',
        filters: { tracks: true, artists: true, albums: true, playlists: true },
        toggleFilter: vi.fn(),
        loading: false,
        visibleTracks,
        visibleArtists: [],
        visibleAlbums: [],
        visiblePlaylists: [],
        totalResults: visibleTracks.length,
    }),
}));

function makeTrack(overrides: Partial<SearchTrackResult>): SearchTrackResult {
    return {
        uuid: 'track-1',
        title: 'Track title',
        artists: [{ uuid: 'artist-1', name: 'Artist' }],
        durationSec: 120,
        filePath: '/files/track-1.mp3',
        ...overrides,
    };
}

describe('SearchPage handlePlayTrack branching', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        visibleTracks = [];
    });

    it('navigates to the album path when the track belongs to an album', () => {
        visibleTracks = [
            makeTrack({
                uuid: 'track-album',
                containerPlaylist: { uuid: 'album-uuid', name: 'My Album', isAlbum: true },
            }),
        ];

        render(<SearchPage />);
        fireEvent.click(screen.getByText('Track title'));

        expect(navigateSpy).toHaveBeenCalledWith('/album/album-uuid?track=track-album');
        expect(playSpy).not.toHaveBeenCalled();
        expect(setSongInfoSpy).not.toHaveBeenCalled();
        expect(recordFindingSpy).toHaveBeenCalledWith('test', 'album', 'album-uuid', 'My Album', '');
    });

    it('navigates to the playlist path when the track belongs to a non-album playlist', () => {
        visibleTracks = [
            makeTrack({
                uuid: 'track-playlist',
                containerPlaylist: { uuid: 'playlist-uuid', name: 'My Playlist', isAlbum: false },
            }),
        ];

        render(<SearchPage />);
        fireEvent.click(screen.getByText('Track title'));

        expect(navigateSpy).toHaveBeenCalledWith('/playlist/playlist-uuid?track=track-playlist');
        expect(playSpy).not.toHaveBeenCalled();
        expect(setSongInfoSpy).not.toHaveBeenCalled();
        expect(recordFindingSpy).toHaveBeenCalledWith('test', 'playlist', 'playlist-uuid', 'My Playlist', '');
    });

    it('plays the track directly when it has no container playlist', () => {
        visibleTracks = [makeTrack({ uuid: 'track-single', containerPlaylist: undefined })];

        render(<SearchPage />);
        fireEvent.click(screen.getByText('Track title'));

        expect(navigateSpy).not.toHaveBeenCalled();
        expect(setSongInfoSpy).toHaveBeenCalledWith('Track title', 'Artist', null, [
            { uuid: 'artist-1', name: 'Artist' },
        ]);
        expect(playSpy).toHaveBeenCalledWith('/files/track-1.mp3');
        expect(recordFindingSpy).not.toHaveBeenCalled();
    });

    it('records an artist finding and navigates when an artist name in a track row is clicked', () => {
        visibleTracks = [makeTrack({ uuid: 'track-artist', containerPlaylist: undefined })];

        render(<SearchPage />);
        fireEvent.click(screen.getByText('Artist'));

        expect(navigateSpy).toHaveBeenCalledWith('/artist/artist-1');
        expect(recordFindingSpy).toHaveBeenCalledWith('test', 'artist', 'artist-1', 'Artist', '');
    });
});

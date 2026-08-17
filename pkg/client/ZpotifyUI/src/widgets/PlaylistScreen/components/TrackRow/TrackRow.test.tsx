import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

const navigateSpy = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => navigateSpy,
}));

import TrackRow from '@/widgets/PlaylistScreen/components/TrackRow/TrackRow.tsx';
import type { SongBase } from '@/app/api/zpotify';

function makeSong(overrides: Partial<SongBase> = {}): SongBase {
    return {
        id: '1',
        title: 'Track title',
        filePath: '/files/1.mp3',
        durationSec: 180,
        artists: [{ uuid: 'a1', name: 'Artist' }],
        ...overrides,
    };
}

function baseProps() {
    return {
        song: makeSong(),
        index: 1,
        isCurrent: false,
        isPlaying: false,
        isLoading: false,
        isLiked: false,
        isHeartAnimating: false,
        onPlay: vi.fn(),
        onToggleLike: vi.fn(),
    };
}

describe('TrackRow cover thumbnail', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('does not render a cover cell when showCover is not passed', () => {
        render(<TrackRow {...baseProps()} />);
        expect(screen.queryByTestId('track-row-cover')).toBeNull();
    });

    it('does not render a cover cell when showCover is false', () => {
        render(<TrackRow {...baseProps()} showCover={false} />);
        expect(screen.queryByTestId('track-row-cover')).toBeNull();
    });

    it('renders a cover cell when showCover is true, even without a coverFilePath', () => {
        render(<TrackRow {...baseProps()} showCover song={makeSong({ coverFilePath: undefined })} />);
        expect(screen.getByTestId('track-row-cover')).not.toBeNull();
    });

    it('renders a cover cell using the song cover when showCover is true and coverFilePath is set', () => {
        render(<TrackRow {...baseProps()} showCover song={makeSong({ coverFilePath: 'covers/1.jpg' })} />);
        const coverCell = screen.getByTestId('track-row-cover');
        expect(coverCell).not.toBeNull();
        expect(coverCell.querySelector('img')).not.toBeNull();
    });
});

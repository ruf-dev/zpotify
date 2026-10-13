import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import type { TorrentSearchStatus } from '@/app/api/zpotify';
import { TORRENT_SEARCH_STATUSES } from '@/shared/api/TorrentSearchStatuses.ts';
import { TORRENT_SEARCH_UNREACHABLE_HINT } from '@/shared/lib/torrentSearchStatus.ts';
import TrackerSearchPromptWidget from '@/pages/main/search/Widget/TrackerSearchPromptWidget/TrackerSearchPromptWidget.tsx';

const openDialogMock = vi.fn();
vi.mock('@/app/hooks/Dialog.tsx', () => ({
    useDialog: () => ({ OpenDialog: openDialogMock }),
}));

vi.mock('@/dialogs/AddTrack/AddTrackDialog.tsx', () => ({ default: () => null }));

let canUpload = true;
vi.mock('@/entities/user/useUser.ts', () => ({
    default: (selector: (state: { userData: { permissions: { canUpload: boolean } } }) => unknown) =>
        selector({ userData: { permissions: { canUpload } } }),
}));

let torrentSearchStatus: TorrentSearchStatus = TORRENT_SEARCH_STATUSES.available;
vi.mock('@/features/upload/useTorrentSearchStatus.ts', () => ({
    useTorrentSearchStatus: () => torrentSearchStatus,
}));

describe('TrackerSearchPromptWidget', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        canUpload = true;
        torrentSearchStatus = TORRENT_SEARCH_STATUSES.available;
    });

    it('renders nothing when the user cannot upload', () => {
        canUpload = false;

        render(<TrackerSearchPromptWidget query="radiohead" />);

        expect(screen.queryByText('Try search on trackers')).toBeNull();
    });

    it('renders nothing when tracker search is disabled', () => {
        torrentSearchStatus = TORRENT_SEARCH_STATUSES.disabled;

        render(<TrackerSearchPromptWidget query="radiohead" />);

        expect(screen.queryByText('Try search on trackers')).toBeNull();
    });

    it('opens the tracker search dialog when the link is clicked', () => {
        render(<TrackerSearchPromptWidget query="radiohead" />);

        fireEvent.click(screen.getByText('Try search on trackers'));

        expect(openDialogMock).toHaveBeenCalledTimes(1);
    });

    it('shows a disabled link with the administrator hint when the indexer is unreachable', () => {
        torrentSearchStatus = TORRENT_SEARCH_STATUSES.unreachable;

        render(<TrackerSearchPromptWidget query="radiohead" />);

        const button = screen.getByRole('button', { name: 'Try search on trackers' });
        fireEvent.click(button);

        expect(button.hasAttribute('disabled')).toBe(true);
        expect(screen.getByTitle(TORRENT_SEARCH_UNREACHABLE_HINT)).toBeTruthy();
        expect(openDialogMock).not.toHaveBeenCalled();
    });
});

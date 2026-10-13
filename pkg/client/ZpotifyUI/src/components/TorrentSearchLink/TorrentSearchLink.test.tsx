import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import TorrentSearchLink from '@/components/TorrentSearchLink/TorrentSearchLink.tsx';
import type { TorrentSearchStatus } from '@/app/api/zpotify';
import { TORRENT_SEARCH_STATUSES } from '@/shared/api/TorrentSearchStatuses.ts';
import { TORRENT_SEARCH_UNREACHABLE_HINT } from '@/shared/lib/torrentSearchStatus.ts';

function renderLink(status: TorrentSearchStatus) {
    const onClick = vi.fn();

    const result = render(<TorrentSearchLink status={status} label="Search trackers" onClick={onClick} />);

    return { onClick, container: result.container };
}

describe('TorrentSearchLink', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders an enabled button and calls onClick when the status is available', () => {
        const { onClick } = renderLink(TORRENT_SEARCH_STATUSES.available);

        const button = screen.getByRole('button', { name: 'Search trackers' });
        fireEvent.click(button);

        expect(button.hasAttribute('disabled')).toBe(false);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders a disabled button with the administrator hint when the status is unreachable', () => {
        const { onClick } = renderLink(TORRENT_SEARCH_STATUSES.unreachable);

        const button = screen.getByRole('button', { name: 'Search trackers' });
        fireEvent.click(button);

        expect(button.hasAttribute('disabled')).toBe(true);
        expect(screen.getByTitle(TORRENT_SEARCH_UNREACHABLE_HINT)).toBeTruthy();
        expect(onClick).not.toHaveBeenCalled();
    });

    it('renders nothing when the status is disabled', () => {
        const { container } = renderLink(TORRENT_SEARCH_STATUSES.disabled);

        expect(container.firstChild).toBeNull();
    });

    it('renders nothing when the status is unspecified', () => {
        const { container } = renderLink(TORRENT_SEARCH_STATUSES.unspecified);

        expect(container.firstChild).toBeNull();
    });
});

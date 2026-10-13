import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import TorrentFilesSkeleton from '@/dialogs/AddTrack/screens/components/TorrentFilesSkeleton/TorrentFilesSkeleton';

describe('TorrentFilesSkeleton', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the title when one is given', () => {
        render(<TorrentFilesSkeleton title="Radiohead - OK Computer" />);

        expect(screen.getByLabelText('Loading torrent files')).not.toBeNull();
        expect(screen.getByText('Radiohead - OK Computer')).not.toBeNull();
    });

    it('omits the title when it is empty', () => {
        const { container } = render(<TorrentFilesSkeleton title="" />);

        expect(container.querySelector('span')).toBeNull();
    });
});

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import TorrentFileStatusList from '@/dialogs/TorrentManage/components/TorrentFileStatusList/TorrentFileStatusList';
import type { TorrentFileRow } from '@/dialogs/TorrentManage/processes/mergeTorrentFiles';

function makeFiles(...paths: string[]): TorrentFileRow[] {
    return paths.map((path) => ({ path, downloadedBytes: '0', totalBytes: '100' }));
}

describe('TorrentFileStatusList', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders folder headers and file names for nested paths', () => {
        render(<TorrentFileStatusList files={makeFiles('Album/CD1/01 Song.mp3', 'Album/CD2/02 Song.mp3')} />);

        expect(screen.getByText('CD1')).not.toBeNull();
        expect(screen.getByText('CD2')).not.toBeNull();
        expect(screen.getByText('01 Song.mp3')).not.toBeNull();
        expect(screen.getByText('02 Song.mp3')).not.toBeNull();
    });

    it('hides the wrapper folder shared by every file', () => {
        render(<TorrentFileStatusList files={makeFiles('Album/CD1/01.mp3', 'Album/CD2/01.mp3')} />);

        expect(screen.queryByText('Album')).toBeNull();
    });

    it('renders a flat list without folder headers when no file has a folder', () => {
        render(<TorrentFileStatusList files={makeFiles('a.mp3', 'b.mp3')} />);

        expect(screen.getByText('a.mp3')).not.toBeNull();
        expect(screen.getByText('b.mp3')).not.toBeNull();
        expect(screen.queryByText(/files?$/)).toBeNull();
    });

    it('shows the file count in a folder header', () => {
        render(<TorrentFileStatusList files={makeFiles('A/1.mp3', 'A/2.mp3', 'B/1.mp3')} />);

        expect(screen.getByText('2 files')).not.toBeNull();
        expect(screen.getByText('1 file')).not.toBeNull();
    });

    it('keeps rows rendered after a folder header is toggled twice', () => {
        render(<TorrentFileStatusList files={makeFiles('A/1.mp3', 'B/1.mp3')} />);

        fireEvent.click(screen.getByText('A'));
        fireEvent.click(screen.getByText('A'));

        expect(screen.getByText('A')).not.toBeNull();
        expect(screen.getAllByText('1.mp3')).toHaveLength(2);
    });
});

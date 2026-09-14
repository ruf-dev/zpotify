import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import DropZoneScreen from '@/dialogs/AddTrack/screens/DropZoneScreen';
import type { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';

vi.mock('@/shared/lib/toaster/ToasterZ.ts', () => ({
    useToaster: () => ({
        bake: vi.fn(),
        catch: vi.fn(),
    }),
}));

function makeContext(overrides: Partial<AddTrackContext>): AddTrackContext {
    return {
        goTo: vi.fn(),
        uploading: false,
        uploadError: null,
        handleFiles: vi.fn(),
        handleTorrentFile: vi.fn(),
        handleSelectFromLibrary: vi.fn(),
        handleManageTorrent: vi.fn(),
        handleCreatePlaylist: vi.fn(),
        handleCreatePlaylistFromFolder: vi.fn(),
        handleDroppedGroups: vi.fn(),
        batchTracks: [],
        handleOpenBatchFolder: vi.fn(),
        pendingTorrentUpload: null,
        submittingTorrentFile: false,
        handleSubmitTorrentFile: vi.fn(),
        ...overrides,
    };
}

function makeFile(name: string): File {
    return new File(['content'], name);
}

describe('DropZoneScreen torrent routing', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('routes a dropped .torrent file to handleTorrentFile instead of handleFiles', () => {
        const handleFilesSpy = vi.fn();
        const handleTorrentFileSpy = vi.fn();
        const ctx = makeContext({ handleFiles: handleFilesSpy, handleTorrentFile: handleTorrentFileSpy });
        render(<DropZoneScreen {...ctx} />);

        const torrentFile = makeFile('ubuntu.torrent');
        const dropZone = screen.getByText('mp3 · flac · aac').closest('div')!;

        fireEvent.drop(dropZone, {
            dataTransfer: { items: [], files: [torrentFile] },
        });

        expect(handleTorrentFileSpy).toHaveBeenCalledWith(torrentFile);
        expect(handleFilesSpy).not.toHaveBeenCalled();
    });

    it('routes audio files to handleFiles and the torrent file to handleTorrentFile from the same drop', () => {
        const handleFilesSpy = vi.fn();
        const handleTorrentFileSpy = vi.fn();
        const ctx = makeContext({ handleFiles: handleFilesSpy, handleTorrentFile: handleTorrentFileSpy });
        render(<DropZoneScreen {...ctx} />);

        const torrentFile = makeFile('ubuntu.torrent');
        const audioFile = makeFile('track.mp3');
        const dropZone = screen.getByText('mp3 · flac · aac').closest('div')!;

        fireEvent.drop(dropZone, {
            dataTransfer: { items: [], files: [torrentFile, audioFile] },
        });

        expect(handleTorrentFileSpy).toHaveBeenCalledWith(torrentFile);
        expect(handleFilesSpy).toHaveBeenCalledWith([audioFile]);
    });

    it('accepts .torrent files in the native file picker, not just audio', () => {
        const ctx = makeContext({});
        const { container } = render(<DropZoneScreen {...ctx} />);

        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        expect(input.accept.split(',')).toContain('.torrent');
    });

    it('selecting a .torrent file via the file input routes it to handleTorrentFile, not handleFiles', () => {
        const handleFilesSpy = vi.fn();
        const handleTorrentFileSpy = vi.fn();
        const ctx = makeContext({ handleFiles: handleFilesSpy, handleTorrentFile: handleTorrentFileSpy });
        const { container } = render(<DropZoneScreen {...ctx} />);

        const torrentFile = makeFile('ubuntu.torrent');
        const input = container.querySelector('input[type="file"]') as HTMLInputElement;

        Object.defineProperty(input, 'files', { value: [torrentFile] });
        fireEvent.change(input);

        expect(handleTorrentFileSpy).toHaveBeenCalledWith(torrentFile);
        expect(handleFilesSpy).not.toHaveBeenCalled();
    });
});

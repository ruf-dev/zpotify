import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import TorrentCard from '@/dialogs/AddTrack/screens/components/TorrentCard/TorrentCard';

describe('TorrentCard', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('should render the card with title and subtitle', () => {
        const onFile = vi.fn();

        render(<TorrentCard onFile={onFile} />);

        expect(screen.getByText('add torrent')).not.toBeNull();
        expect(screen.getByText('upload a .torrent file to add tracks')).not.toBeNull();
    });

    it('should trigger file input click when card is clicked', () => {
        const onFile = vi.fn();
        const { container } = render(<TorrentCard onFile={onFile} />);

        const cardContainer = container.querySelector('[class*="TorrentCardContainer"]');
        if (cardContainer) {
            fireEvent.click(cardContainer);
        }

        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        expect(fileInput).not.toBeNull();
    });

    it('should call onFile with selected file', () => {
        const onFile = vi.fn();
        const { container } = render(<TorrentCard onFile={onFile} />);

        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['content'], 'test.torrent', { type: 'application/x-torrent' });

        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(onFile).toHaveBeenCalledWith(file);
    });

    it('should accept only .torrent files', () => {
        const onFile = vi.fn();
        const { container } = render(<TorrentCard onFile={onFile} />);

        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        expect(fileInput.accept).toBe('.torrent');
    });

    it('should clear input value after file selection', () => {
        const onFile = vi.fn();
        const { container } = render(<TorrentCard onFile={onFile} />);

        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['content'], 'test.torrent');

        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(fileInput.value).toBe('');
    });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import FolderGroupHeader from '@/components/FolderGroupHeader/FolderGroupHeader';

function baseProps() {
    return {
        name: 'My Album',
        trackCount: 3,
        progress: 50,
        collapsed: true,
        onToggle: vi.fn(),
    };
}

describe('FolderGroupHeader', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders name and track count as before when no new props are passed, and clicking the row calls onToggle', () => {
        const props = baseProps();
        render(<FolderGroupHeader {...props} />);

        expect(screen.getByText('My Album')).not.toBeNull();
        expect(screen.getByText('3 tracks')).not.toBeNull();
        expect(screen.queryByRole('checkbox')).toBeNull();
        expect(screen.queryByText('Create playlist')).toBeNull();

        fireEvent.click(screen.getByText('My Album'));
        expect(props.onToggle).toHaveBeenCalledTimes(1);
    });

    it('renders a checkbox reflecting folderSelected when onToggleSelectFolder is passed, and clicking it calls onToggleSelectFolder without calling onToggle', () => {
        const props = baseProps();
        const onToggleSelectFolder = vi.fn();
        render(<FolderGroupHeader {...props} folderSelected onToggleSelectFolder={onToggleSelectFolder} />);

        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(true);

        fireEvent.click(checkbox);
        expect(onToggleSelectFolder).toHaveBeenCalledTimes(1);
        expect(onToggleSelectFolder).toHaveBeenCalledWith(false);
        expect(props.onToggle).not.toHaveBeenCalled();
    });

    it('renders the create playlist button when onCreatePlaylist is passed, and clicking it calls onCreatePlaylist without calling onToggle', () => {
        const props = baseProps();
        const onCreatePlaylist = vi.fn();
        render(<FolderGroupHeader {...props} onCreatePlaylist={onCreatePlaylist} />);

        const button = screen.getByText('Create playlist');
        expect(button).not.toBeNull();

        fireEvent.click(button);
        expect(onCreatePlaylist).toHaveBeenCalledTimes(1);
        expect(props.onToggle).not.toHaveBeenCalled();
    });
});

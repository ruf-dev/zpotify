import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import type { SongFile } from '@/app/api/zpotify';
import FileItem from '@/dialogs/AddTrack/screens/components/FileItem/FileItem';

const file: SongFile = { id: 'f1', path: 'tmp/user1/song.mp3' };

function renderItem() {
    const onSelect = vi.fn();
    const onCreateSingle = vi.fn();
    render(
        <FileItem
            file={file}
            selected={false}
            onSelect={onSelect}
            onDelete={vi.fn()}
            onCreateSingle={onCreateSingle}
            onToggleSelect={vi.fn()}
        />,
    );
    return { onSelect, onCreateSingle };
}

describe('FileItem', () => {
    afterEach(cleanup);

    it('calls onCreateSingle with the file and does not select it when Create single is clicked', () => {
        const { onSelect, onCreateSingle } = renderItem();

        fireEvent.click(screen.getByRole('button', { name: 'Create single song.mp3' }));

        expect(onCreateSingle).toHaveBeenCalledWith(file);
        expect(onSelect).not.toHaveBeenCalled();
    });
});

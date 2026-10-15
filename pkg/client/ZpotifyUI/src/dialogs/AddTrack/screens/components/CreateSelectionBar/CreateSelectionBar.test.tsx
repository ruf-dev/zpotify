import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import CreateSelectionBar from '@/dialogs/AddTrack/screens/components/CreateSelectionBar/CreateSelectionBar';

function renderBar(selectedCount: number) {
    const onCreateSingle = vi.fn();
    const onCreatePlaylist = vi.fn();
    const view = render(
        <CreateSelectionBar
            selectedCount={selectedCount}
            onCreateSingle={onCreateSingle}
            onCreatePlaylist={onCreatePlaylist}
        />,
    );
    return { ...view, onCreateSingle, onCreatePlaylist };
}

describe('CreateSelectionBar', () => {
    afterEach(cleanup);

    it('offers Create single and calls onCreateSingle when one file is selected', () => {
        const { onCreateSingle, onCreatePlaylist } = renderBar(1);

        fireEvent.click(screen.getByRole('button', { name: 'Create single' }));

        expect(onCreateSingle).toHaveBeenCalledTimes(1);
        expect(onCreatePlaylist).not.toHaveBeenCalled();
    });

    it('offers Create playlist and calls onCreatePlaylist when several files are selected', () => {
        const { onCreateSingle, onCreatePlaylist } = renderBar(3);

        fireEvent.click(screen.getByRole('button', { name: 'Create playlist' }));

        expect(onCreatePlaylist).toHaveBeenCalledTimes(1);
        expect(onCreateSingle).not.toHaveBeenCalled();
    });

    it('is hidden from assistive tech when nothing is selected', () => {
        renderBar(0);

        expect(screen.queryByRole('button')).toBeNull();
    });

    it('keeps the last label while collapsing after the selection is cleared', () => {
        const { rerender, onCreateSingle, onCreatePlaylist } = renderBar(2);

        rerender(
            <CreateSelectionBar
                selectedCount={0}
                onCreateSingle={onCreateSingle}
                onCreatePlaylist={onCreatePlaylist}
            />,
        );

        expect(screen.getByText('Create playlist')).toBeTruthy();
        expect(screen.queryByRole('button')).toBeNull();
    });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import ClipboardMagnetPromptDialog from '@/dialogs/ClipboardMagnetPrompt/ClipboardMagnetPromptDialog';

const openDialogMock = vi.fn();
const closeDialogMock = vi.fn();
vi.mock('@/app/hooks/Dialog.tsx', () => ({
    useDialog: () => ({
        OpenDialog: openDialogMock,
        CloseDialog: closeDialogMock,
    }),
}));

const setEnabledMock = vi.fn();
vi.mock('@/entities/ui-settings/useUISettings.ts', () => ({
    useUISettings: (selector: (state: { setClipboardMagnetPromptEnabled: typeof setEnabledMock }) => unknown) =>
        selector({ setClipboardMagnetPromptEnabled: setEnabledMock }),
}));

vi.mock('@/dialogs/AddTrack/AddTrackDialog', () => ({ default: () => null }));

const MAGNET = 'magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a&dn=ubuntu';
const INFO_HASH = 'c12fe1c06bba254a9dc9f519b335aa7c1367a88a';

function renderDialog(displayName = 'Ubuntu 24.04') {
    render(<ClipboardMagnetPromptDialog magnetUri={MAGNET} displayName={displayName} infoHash={INFO_HASH} />);
}

describe('ClipboardMagnetPromptDialog', () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('shows the display name and the first 8 characters of the hash', () => {
        renderDialog();

        expect(screen.getByText('Ubuntu 24.04')).not.toBeNull();
        expect(screen.getByText('c12fe1c0')).not.toBeNull();
    });

    it('shows a placeholder when the magnet has no display name', () => {
        renderDialog('');

        expect(screen.getByText('Unnamed torrent')).not.toBeNull();
    });

    it('opens the add-track dialog when Import is clicked', () => {
        renderDialog();

        fireEvent.click(screen.getByRole('button', { name: 'Import' }));

        expect(openDialogMock).toHaveBeenCalledTimes(1);
        expect(closeDialogMock).not.toHaveBeenCalled();
    });

    it('closes the dialog when Not now is clicked', () => {
        renderDialog();

        fireEvent.click(screen.getByRole('button', { name: 'Not now' }));

        expect(closeDialogMock).toHaveBeenCalledTimes(1);
        expect(setEnabledMock).not.toHaveBeenCalled();
    });

    it('disables the prompt setting and closes when Never prompt me again is clicked', () => {
        renderDialog();

        fireEvent.click(screen.getByRole('button', { name: 'Never prompt me again' }));

        expect(setEnabledMock).toHaveBeenCalledWith(false);
        expect(closeDialogMock).toHaveBeenCalledTimes(1);
    });
});

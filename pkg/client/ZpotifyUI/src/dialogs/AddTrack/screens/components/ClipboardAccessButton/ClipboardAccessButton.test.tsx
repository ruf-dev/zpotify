import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import ClipboardAccessButton from '@/dialogs/AddTrack/screens/components/ClipboardAccessButton/ClipboardAccessButton';
import {
    clipboardPermissionState,
    clipboardSupport,
    readClipboardMagnet,
    readClipboardText,
    type ClipboardSupport,
} from '@/features/upload/magnetLink.ts';

vi.mock('@/features/upload/magnetLink.ts', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/features/upload/magnetLink.ts')>();
    return {
        ...original,
        clipboardSupport: vi.fn(),
        clipboardPermissionState: vi.fn(),
        readClipboardText: vi.fn(),
        readClipboardMagnet: vi.fn(),
    };
});

const MAGNET = 'magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a&dn=ubuntu';

function renderButton(support: ClipboardSupport, ...states: Array<PermissionState | null>) {
    vi.mocked(clipboardSupport).mockResolvedValue(support);
    const [first, ...rest] = states;
    const stateMock = vi.mocked(clipboardPermissionState).mockResolvedValueOnce(first ?? null);
    rest.forEach((state) => stateMock.mockResolvedValueOnce(state));

    const onMagnet = vi.fn();
    render(<ClipboardAccessButton onMagnet={onMagnet} />);
    return { onMagnet };
}

describe('ClipboardAccessButton', () => {
    beforeEach(() => {
        vi.mocked(readClipboardText).mockResolvedValue(null);
        vi.mocked(readClipboardMagnet).mockResolvedValue(null);
    });

    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
    });

    it('shows the allow button when the permission state is prompt', async () => {
        renderButton('persistent', 'prompt');

        expect(await screen.findByRole('button', { name: 'Allow reading clipboard' })).not.toBeNull();
    });

    it('calls onMagnet and hides the button once the permission is granted after a click', async () => {
        vi.mocked(readClipboardText).mockResolvedValue(` ${MAGNET}\n`);
        const { onMagnet } = renderButton('persistent', 'prompt', 'granted');

        fireEvent.click(await screen.findByRole('button', { name: 'Allow reading clipboard' }));

        await waitFor(() => expect(onMagnet).toHaveBeenCalledWith(MAGNET));
        await waitFor(() => expect(screen.queryByRole('button')).toBeNull());
    });

    it('hides the button when the permission is denied after a click', async () => {
        const { onMagnet } = renderButton('persistent', 'prompt', 'denied');

        fireEvent.click(await screen.findByRole('button', { name: 'Allow reading clipboard' }));

        await waitFor(() => expect(screen.queryByRole('button')).toBeNull());
        expect(onMagnet).not.toHaveBeenCalled();
    });

    it('renders nothing and reads the clipboard silently when the permission is already granted', async () => {
        vi.mocked(readClipboardMagnet).mockResolvedValue(MAGNET);
        const { onMagnet } = renderButton('persistent', 'granted');

        await waitFor(() => expect(onMagnet).toHaveBeenCalledWith(MAGNET));
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders nothing when the permission is denied', async () => {
        renderButton('persistent', 'denied');

        await waitFor(() => expect(clipboardPermissionState).toHaveBeenCalled());
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders nothing when clipboard reading is unsupported', async () => {
        renderButton('none', null);

        await waitFor(() => expect(clipboardSupport).toHaveBeenCalled());
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('calls onMagnet on every paste click when support is one-shot', async () => {
        vi.mocked(readClipboardText).mockResolvedValue(MAGNET);
        const { onMagnet } = renderButton('oneShot', null, null, null);

        const button = await screen.findByRole('button', { name: 'Paste from clipboard' });
        fireEvent.click(button);
        await waitFor(() => expect(onMagnet).toHaveBeenCalledTimes(1));
        fireEvent.click(button);

        await waitFor(() => expect(onMagnet).toHaveBeenCalledTimes(2));
    });

    it('does not call onMagnet when the pasted text is not a magnet link', async () => {
        vi.mocked(readClipboardText).mockResolvedValue('just text');
        const { onMagnet } = renderButton('oneShot', null, null);

        fireEvent.click(await screen.findByRole('button', { name: 'Paste from clipboard' }));

        await waitFor(() => expect(readClipboardText).toHaveBeenCalled());
        expect(onMagnet).not.toHaveBeenCalled();
    });
});

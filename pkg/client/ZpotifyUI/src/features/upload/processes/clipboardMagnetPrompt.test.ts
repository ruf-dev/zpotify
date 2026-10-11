import { describe, expect, it } from 'vitest';

import {
    shouldPromptClipboardMagnet,
    type ClipboardMagnetPromptInput,
} from '@/features/upload/processes/clipboardMagnetPrompt.ts';

function makeInput(overrides: Partial<ClipboardMagnetPromptInput> = {}): ClipboardMagnetPromptInput {
    return {
        isEnabled: true,
        canUpload: true,
        permissionState: 'granted',
        isDialogOpen: false,
        magnet: { displayName: 'Ubuntu', infoHash: 'abc123' },
        seenInfoHashes: new Set<string>(),
        ...overrides,
    };
}

describe('shouldPromptClipboardMagnet', () => {
    it('returns true when every condition is met', () => {
        expect(shouldPromptClipboardMagnet(makeInput())).toBe(true);
    });

    it('returns false when the setting is disabled', () => {
        expect(shouldPromptClipboardMagnet(makeInput({ isEnabled: false }))).toBe(false);
    });

    it('returns false when the user cannot upload', () => {
        expect(shouldPromptClipboardMagnet(makeInput({ canUpload: false }))).toBe(false);
    });

    it.each<PermissionState | null>(['prompt', 'denied', null])(
        'returns false when the permission state is %s',
        (state) => {
            expect(shouldPromptClipboardMagnet(makeInput({ permissionState: state }))).toBe(false);
        },
    );

    it('returns false when a dialog is already open', () => {
        expect(shouldPromptClipboardMagnet(makeInput({ isDialogOpen: true }))).toBe(false);
    });

    it('returns false when the clipboard holds no magnet link', () => {
        expect(shouldPromptClipboardMagnet(makeInput({ magnet: null }))).toBe(false);
    });

    it('returns false when the info hash was already seen', () => {
        expect(shouldPromptClipboardMagnet(makeInput({ seenInfoHashes: new Set(['abc123']) }))).toBe(false);
    });
});

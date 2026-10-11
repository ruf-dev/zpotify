import type { ParsedMagnet } from '@/features/upload/magnetLink.ts';

export interface ClipboardMagnetPromptInput {
    isEnabled: boolean;
    canUpload: boolean;
    permissionState: PermissionState | null;
    isDialogOpen: boolean;
    magnet: ParsedMagnet | null;
    seenInfoHashes: ReadonlySet<string>;
}

export function shouldPromptClipboardMagnet(input: ClipboardMagnetPromptInput): boolean {
    if (!input.isEnabled || !input.canUpload) return false;
    if (input.permissionState !== 'granted') return false;
    if (input.isDialogOpen) return false;
    if (!input.magnet) return false;

    return !input.seenInfoHashes.has(input.magnet.infoHash);
}

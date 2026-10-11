// Magnet link detection and best-effort clipboard sniffing, sibling to torrentFile.ts.
const MAGNET_PREFIX = 'magnet:?';
const BTIH_MARKER = 'xt=urn:btih:';

export function hasMagnetPrefix(text: string): boolean {
    return text.trim().toLowerCase().startsWith(MAGNET_PREFIX);
}

export function isMagnetLink(text: string): boolean {
    const trimmed = text.trim().toLowerCase();
    return trimmed.startsWith(MAGNET_PREFIX) && trimmed.includes(BTIH_MARKER);
}

export interface ParsedMagnet {
    displayName: string;
    infoHash: string;
}

export type ClipboardSupport = 'persistent' | 'oneShot' | 'none';

export function parseMagnet(uri: string): ParsedMagnet | null {
    if (!isMagnetLink(uri)) return null;

    const query = uri.trim().slice(MAGNET_PREFIX.length);
    const params = new URLSearchParams(query);
    const btihPrefix = BTIH_MARKER.slice('xt='.length);
    const topic = params.getAll('xt').find((xt) => xt.toLowerCase().startsWith(btihPrefix));
    if (!topic) return null;

    return {
        displayName: params.get('dn') ?? '',
        infoHash: topic.slice(btihPrefix.length).toLowerCase(),
    };
}

function queryClipboardPermission(): Promise<PermissionStatus> {
    return Promise.resolve().then(() => navigator.permissions.query({ name: 'clipboard-read' as PermissionName }));
}

// Only Chromium accepts the 'clipboard-read' permission name; Firefox and Safari reject the query and
// raise a per-call "Paste" popup on readText(), so there the read has to be a one-shot user gesture.
export function clipboardSupport(): Promise<ClipboardSupport> {
    return queryClipboardPermission()
        .then((): ClipboardSupport => 'persistent')
        .catch((): ClipboardSupport => (typeof navigator.clipboard?.readText === 'function' ? 'oneShot' : 'none'));
}

export function clipboardPermissionState(): Promise<PermissionState | null> {
    return queryClipboardPermission()
        .then((status) => status.state)
        .catch(() => null);
}

export function readClipboardText(): Promise<string | null> {
    return Promise.resolve()
        .then(() => navigator.clipboard.readText())
        .catch(() => null);
}

// Never prompts: reads only when the permission is already granted.
export function readClipboardMagnet(): Promise<string | null> {
    return clipboardPermissionState().then((state) => {
        if (state !== 'granted') return null;

        return readClipboardText().then((text) => (text !== null && isMagnetLink(text) ? text.trim() : null));
    });
}

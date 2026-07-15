export function cleanTitle(filename: string): string {
    return filename
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .trim();
}

const TRACK_NUMBER_PREFIX = /^(\d{1,3})\s+(.+)$/;

export function canCleanTrackNumbers(titles: string[]): boolean {
    if (titles.length === 0) return false;
    return titles.every(function titleHasMatchingOrder(title, idx) {
        const match = TRACK_NUMBER_PREFIX.exec(title);
        return !!match && Number(match[1]) === idx + 1;
    });
}

export function cleanTrackNumber(title: string): string {
    const match = TRACK_NUMBER_PREFIX.exec(title);
    return match ? match[2].trim() : title;
}

export function getCleanablePrefixLength(title: string): number {
    const match = TRACK_NUMBER_PREFIX.exec(title);
    return match ? title.length - match[2].length : 0;
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatTotalSize(files: File[]): string {
    const total = files.reduce((s, f) => s + f.size, 0);
    return formatBytes(total);
}

export async function computeHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

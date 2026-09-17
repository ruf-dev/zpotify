import type { DroppedFolder } from '@/features/upload/resolveDroppedEntries.ts';
import type { SongFile } from '@/app/api/zpotify';
import { parseSongFilePath } from '@/dialogs/AddTrack/screens/parseSongFilePath.ts';

export function isSingleFolderInput(folders: DroppedFolder[], existingFiles: SongFile[]): boolean {
    if (folders.length > 0) return folders.length === 1 && existingFiles.length === 0;
    if (existingFiles.length === 0) return false;
    const folderNames = new Set(existingFiles.map((f) => parseSongFilePath(f.path).folderName));
    return folderNames.size === 1 && !folderNames.has(undefined);
}

export function cleanTitle(filename: string): string {
    return filename
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .trim();
}

// Matches "01 Title" and "01 02 Title" (a disc/session tag plus track number) alike. When a
// second number is present, it's the incrementing track index checked against track order and
// the first is a constant tag dropped along with it; with only one number, that one is the
// track index.
const TRACK_NUMBER_PREFIX = /^(\d{1,3})(?:\s+(\d{1,3}))?\s+(.+)$/;

function orderNumber(match: RegExpExecArray): number {
    return Number(match[2] ?? match[1]);
}

export function canCleanTrackNumbers(titles: string[]): boolean {
    if (titles.length === 0) return false;
    return titles.every(function titleHasMatchingOrder(title, idx) {
        const match = TRACK_NUMBER_PREFIX.exec(title);
        return !!match && orderNumber(match) === idx + 1;
    });
}

export function cleanTrackNumber(title: string): string {
    const match = TRACK_NUMBER_PREFIX.exec(title);
    return match ? match[3].trim() : title;
}

export function getCleanablePrefixLength(title: string): number {
    const match = TRACK_NUMBER_PREFIX.exec(title);
    return match ? title.length - match[3].length : 0;
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

import {formatDuration} from '@/shared/lib/time.ts';

export function formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024) {
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
}

export function formatFileDuration(sec: string | undefined): string {
    if (!sec) return '—';
    return formatDuration(Math.round(Number(sec)));
}

export function formatFileBytes(bytes: string | undefined, fallback: number): string {
    return formatFileSize(bytes ? Number(bytes) : fallback);
}

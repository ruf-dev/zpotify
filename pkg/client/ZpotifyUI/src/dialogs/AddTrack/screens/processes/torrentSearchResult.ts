const LOSSLESS_PATTERN = /\b(flac|alac|ape|wav|lossless|24[- ]?bit|hi-?res)\b/i;

const BYTES_IN_KB = 1024;
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

const DAYS_IN_MONTH = 30;
const DAYS_IN_YEAR = 365;
const MS_IN_DAY = 24 * 60 * 60 * 1000;

export function isLosslessTitle(title: string): boolean {
    return LOSSLESS_PATTERN.test(title);
}

export function formatTorrentSize(sizeBytes: string | undefined): string {
    const bytes = Number(sizeBytes);
    if (!sizeBytes || !Number.isFinite(bytes) || bytes < 0) return '';

    let value = bytes;
    let unitIndex = 0;
    while (value >= BYTES_IN_KB && unitIndex < SIZE_UNITS.length - 1) {
        value /= BYTES_IN_KB;
        unitIndex++;
    }

    const digits = unitIndex < 2 ? 0 : 1;
    return `${value.toFixed(digits)} ${SIZE_UNITS[unitIndex]}`;
}

export function formatTorrentAge(publishedAt: string | undefined, now: Date): string {
    if (!publishedAt) return '';

    const published = new Date(publishedAt).getTime();
    if (Number.isNaN(published)) return '';

    const days = Math.floor((now.getTime() - published) / MS_IN_DAY);
    if (days < 1) return 'today';
    if (days < DAYS_IN_MONTH) return `${days} d ago`;
    if (days < DAYS_IN_YEAR) return `${Math.floor(days / DAYS_IN_MONTH)} mo ago`;
    return `${Math.floor(days / DAYS_IN_YEAR)} y ago`;
}

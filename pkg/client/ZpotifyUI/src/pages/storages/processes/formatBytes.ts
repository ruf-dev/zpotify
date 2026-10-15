const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
const STEP = 1024;
const ONE_DECIMAL_LIMIT = 10;

export function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

    let value = bytes;
    let unitIndex = 0;
    while (value >= STEP && unitIndex < UNITS.length - 1) {
        value /= STEP;
        unitIndex++;
    }

    const digits = unitIndex > 0 && value < ONE_DECIMAL_LIMIT ? 1 : 0;

    return `${Number(value.toFixed(digits))} ${UNITS[unitIndex]}`;
}

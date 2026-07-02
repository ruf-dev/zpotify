export function buildCoverUrl(filePath?: string): string | undefined {
    if (!filePath) return undefined;
    const base = (import.meta.env.VITE_ZPOTIFY_WEBSERVER as string | undefined) ?? '';
    return `${base}/${filePath}`;
}

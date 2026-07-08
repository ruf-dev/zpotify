interface CoverSeedSource {
    coverFilePath?: string;
    uuid?: string;
}

export function resolveCoverSeed({ coverFilePath, uuid }: CoverSeedSource): number {
    const match = (coverFilePath ?? '').match(/^generative:(\d+)$/);
    if (match) {
        return parseInt(match[1], 10);
    }
    return ((uuid ?? '0').charCodeAt(0) % 7) + 1;
}

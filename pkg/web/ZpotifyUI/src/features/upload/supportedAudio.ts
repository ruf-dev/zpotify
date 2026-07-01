// Audio formats the platform can parse. Keep in sync with the backend
// (internal/audio_parsers). Uploads outside this set are rejected.
export const SUPPORTED_AUDIO_EXTENSIONS = ['.mp3', '.flac', '.aac'] as const;

// Value for a file input's `accept` attribute limiting the picker to audio we support.
export const AUDIO_ACCEPT = SUPPORTED_AUDIO_EXTENSIONS.join(',');

export function isSupportedAudioFile(file: File): boolean {
    const name = file.name.toLowerCase();
    return SUPPORTED_AUDIO_EXTENSIONS.some((ext) => name.endsWith(ext));
}

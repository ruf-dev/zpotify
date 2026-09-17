// Audio formats the platform can parse, used only as a hint to the native file
// picker — actual track ingestion no longer rejects other extensions client-side.
export const SUPPORTED_AUDIO_EXTENSIONS = ['.mp3', '.flac', '.aac', '.m4a'] as const;

// Value for a file input's `accept` attribute limiting the picker to audio we support.
export const AUDIO_ACCEPT = SUPPORTED_AUDIO_EXTENSIONS.join(',');

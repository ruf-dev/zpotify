export type TrackPreview = { title: string; artist: string };

export type AlbumCardProps = {
    uuid: string;
    name: string;
    artists: Array<{ uuid: string; name: string }>;
    seed: number;
    coverUrl?: string;
};

export type PlaylistCardWideProps = {
    uuid: string;
    name: string;
    songCount?: number;
    description?: string;
    seed: number;
    coverUrl?: string;
    tracks: TrackPreview[];
    avatarFallbackUrl?: string;
    avatarFallbackLabel?: string;
};

export type LibraryItem = ({ kind: 'album' } & AlbumCardProps) | ({ kind: 'playlist' } & PlaylistCardWideProps);

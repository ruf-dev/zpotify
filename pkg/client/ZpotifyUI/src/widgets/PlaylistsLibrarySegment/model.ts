export type TrackPreview = { title: string; artist: string };

export type AlbumCardProps = {
    uuid: string;
    name: string;
    artistNames: string;
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
};

export type LibraryItem =
    | ({ kind: 'album' } & AlbumCardProps)
    | ({ kind: 'playlist' } & PlaylistCardWideProps);

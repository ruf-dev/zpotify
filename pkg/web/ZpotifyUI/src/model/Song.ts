export type Song = {
    uniqueId: string;
    title: string;
    artistsNames: string[]
    duration: string
}

export type SongList = {
    songs: Song[]
    total: number
}

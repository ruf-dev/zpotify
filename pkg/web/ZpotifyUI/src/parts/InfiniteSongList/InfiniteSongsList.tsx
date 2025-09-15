import {useEffect, useState} from "react";

import SongListWidget from "@/widgets/TrackList/TrackListWidget.tsx";

import {Song} from "@/model/Song.ts";
import {ListGlobalSongs} from "@/processes/Songs.ts";
import {AudioPlayer} from "@/hooks/player/player.ts";

interface InfiniteSongsListProps {
    audioPlayer: AudioPlayer
}

const songsPerPage = 10;

export default function InfiniteSongsList({audioPlayer}: InfiniteSongsListProps) {
    const [offset, setOffset] = useState(0)

    const [songs, setSongs] = useState<Song[]>([])

    useEffect(() => {
        setOffset(0)
        ListGlobalSongs(songsPerPage, offset)
            .then((resp) => {
                setSongs(prev => [...prev, ...resp.songs])
            })
    }, []);

    return (
        <SongListWidget
            songs={songs}
            audioPlayer={audioPlayer}
        />
    )
}

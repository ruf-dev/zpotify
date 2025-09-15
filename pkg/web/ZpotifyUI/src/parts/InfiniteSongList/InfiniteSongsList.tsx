import cls from "@/parts/InfiniteSongList/InfiniteSongsList.module.css";

import {useEffect, useState} from "react";

import SongListWidget from "@/widgets/TrackList/TrackListWidget.tsx";

import {Song} from "@/model/Song.ts";
import {ListGlobalSongs} from "@/processes/Songs.ts";
import {AudioPlayer} from "@/hooks/player/player.ts";
import ZButton from "@/components/base/button/ZButton.tsx";

interface InfiniteSongsListProps {
    audioPlayer: AudioPlayer
}

const songsPerPage = 10;

export default function InfiniteSongsList({audioPlayer}: InfiniteSongsListProps) {
    const [offset, setOffset] = useState(0)

    const [songs, setSongs] = useState<Song[]>([])

    const [isListEnded, setIsListEnded] = useState(false)

    useEffect(() => {
        ListGlobalSongs(songsPerPage, offset)
            .then((resp) => {
                setSongs(prev => [...prev, ...resp.songs])

                setIsListEnded(resp.total == (songs.length+resp.songs.length))
            })

    }, [offset]);


    function loadMore() {
        setOffset(offset + songsPerPage)
    }

    return (
        <div className={cls.InfiniteSongsListContainer}>
            <SongListWidget
                songs={songs}
                audioPlayer={audioPlayer}
            />

            {isListEnded ? null : <ZButton
                title={"Load more"}
                onClick={loadMore}
            />}
        </div>
    )
}

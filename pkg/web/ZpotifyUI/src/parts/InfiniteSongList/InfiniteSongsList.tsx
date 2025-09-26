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
    const [shuffleHash, setShuffleHash] = useState<number | null>(null);

    const [songs, setSongs] = useState<Song[]>([])
    const [isListEnded, setIsListEnded] = useState(false)

    function loadTracksPage() {
        ListGlobalSongs(songsPerPage, offset, shuffleHash)
            .then((resp) => {

                setSongs(prev => [...prev, ...resp.songs.filter((newSong) => {
                    return !prev.some(old => old.uniqueId == newSong.uniqueId)
                })])

                setIsListEnded(resp.total == (songs.length + resp.songs.length))
            })
    }

    function loadTracksShuffled() {
        ListGlobalSongs(songs.length, 0, shuffleHash)
            .then((resp) => {
                setSongs(resp.songs)
                setIsListEnded(resp.total == resp.songs.length)
            })
    }


    useEffect(() => {
        loadTracksPage()
    }, [offset]);

    useEffect(() => {
        loadTracksShuffled()
    }, [shuffleHash]);

    useEffect(() => {
        setShuffleHash(audioPlayer.shuffleHash)
    }, [audioPlayer.shuffleHash]);

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

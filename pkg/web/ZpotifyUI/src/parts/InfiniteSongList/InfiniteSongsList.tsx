import cls from "@/parts/InfiniteSongList/InfiniteSongsList.module.css";

import {useEffect, useState} from "react";

import SongListWidget from "@/widgets/TrackList/TrackListWidget.tsx";

import {Song} from "@/model/Song.ts";
import {ListSongs} from "@/processes/Songs.ts";
import {AudioPlayer} from "@/hooks/player/player.ts";
import ZButton from "@/components/base/button/ZButton.tsx";

interface InfiniteSongsListProps {
    audioPlayer: AudioPlayer

    playlistId?: string
}

const songsPerPage = 10;

export default function InfiniteSongsList({audioPlayer, playlistId}: InfiniteSongsListProps) {
    const [offset, setOffset] = useState(0)
    const [shuffleHash, setShuffleHash] = useState<number | null>(null);

    const [songs, setSongs] = useState<Song[]>([])
    const [isListEnded, setIsListEnded] = useState(false)

    function loadTracksPage() {
        ListSongs(songsPerPage, offset, shuffleHash, playlistId)
            .then((resp) => {

                setSongs(prev => [...prev, ...resp.songs.filter((newSong) => {
                    return !prev.some(old => old.uniqueId == newSong.uniqueId)
                })])

                setIsListEnded(resp.total == (songs.length + resp.songs.length))
            })
    }

    async function loadTracksShuffled(hash: number): Promise<string> {
        return ListSongs(songs.length, 0, hash, playlistId)
            .then((resp) => {
                setSongs(resp.songs)
                setIsListEnded(resp.total == resp.songs.length)

                return resp.songs[0].uniqueId
            })
    }


    useEffect(() => {
        loadTracksPage()
    }, [offset]);

    useEffect(() => {
        if (!shuffleHash) return

        loadTracksShuffled(shuffleHash)
            .then((firstSongId) => {
                audioPlayer.play(firstSongId)
            })
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

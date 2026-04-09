import cn from "classnames";
import {useEffect, useState} from "react";
import {SongBase} from "@/app/api/zpotify";

import cls from "@/parts/InfiniteSongList/InfiniteSongsList.module.css";
import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/User.ts";

import {useToaster} from "@/hooks/toaster/ToasterZ.ts";
import SongListWidget from "@/widgets/TrackList/TrackListWidget.tsx";
import ZButton from "@/components/base/button/ZButton.tsx";

interface InfiniteSongsListProps {
    audioPlayer: AudioPlayer
    user: User

    playlistId: string

    // if true - block becomes scrollable
    fixedSize?: boolean
}

const songsPerPage = 10;

export default function LazyLoadSongsList({audioPlayer, playlistId, user, fixedSize}: InfiniteSongsListProps) {
    const [offset, setOffset] = useState(0)
    const [shuffleHash, setShuffleHash] = useState<string | undefined>();

    const [songs, setSongs] = useState<SongBase[]>([])
    const [isListEnded, setIsListEnded] = useState(false)

    const playlistService = user.Services().Playlist()

    const toaster = useToaster();

    function loadTracksPage() {
        playlistService
            .ListSongs(playlistId, offset, songsPerPage, shuffleHash?.toString())
            .then((resp) => {
                resp.songs = resp.songs || [];

                setSongs(prev => [...prev, ...(resp.songs || []).filter((newSong) => {
                    return !prev.some(old => old.id == newSong.id)
                })])

                setIsListEnded(resp.total == (songs.length + resp.songs.length))
            })
            .catch(toaster.catch)
    }

    async function loadTracksShuffled(hash: string): Promise<string> {
        return playlistService.ListSongs(playlistId, 0, songs.length, hash)
            .then((resp) => {
                if (!resp.songs) return

                setSongs(resp.songs)
                setIsListEnded(resp.total == resp.songs?.length)

                return resp.songs[0].id
            })
            .catch(toaster.catch)
            .then()
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
        setShuffleHash(audioPlayer.shuffleHash?.toString())
    }, [audioPlayer.shuffleHash]);

    function loadMore() {
        setOffset(offset + songsPerPage)
    }

    return (
        <div className={cn(cls.InfiniteSongsListContainer, {
            [cls.scrollable]: fixedSize,
        })}>
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

import cls from "@/parts/InfiniteSongList/InfiniteSongsList.module.css";

import {useEffect, useState} from "react";

import SongListWidget from "@/widgets/TrackList/TrackListWidget.tsx";

import {Song} from "@/model/Song.ts";

import {AudioPlayer} from "@/hooks/player/player.ts";
import ZButton from "@/components/base/button/ZButton.tsx";
import {User} from "@/hooks/user/User.ts";
import {SongListPermissions} from "@/model/User.ts";

interface InfiniteSongsListProps {
    audioPlayer: AudioPlayer
    user: User

    playlistId?: string
}

const songsPerPage = 10;

export default function LazyLoadSongsList({audioPlayer, playlistId, user}: InfiniteSongsListProps) {
    const [offset, setOffset] = useState(0)
    const [shuffleHash, setShuffleHash] = useState<number | null>(null);

    const [songs, setSongs] = useState<Song[]>([])
    const [isListEnded, setIsListEnded] = useState(false)

    const songsService = user.Services().Songs()
    const [permissions, setPermissions] = useState<SongListPermissions>({} as SongListPermissions);


    function loadTracksPage() {
        songsService.ListSongs(songsPerPage, offset, shuffleHash, playlistId)
            .then((resp) => {

                setSongs(prev => [...prev, ...resp.songs.filter((newSong) => {
                    return !prev.some(old => old.uniqueId == newSong.uniqueId)
                })])

                setIsListEnded(resp.total == (songs.length + resp.songs.length))

                const perms = {
                    canDelete: resp.canDeleteSongs
                } as SongListPermissions

                setPermissions(perms)
            })
    }

    async function loadTracksShuffled(hash: number): Promise<string> {
        return songsService.ListSongs(songs.length, 0, hash, playlistId)
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
                permissions={permissions}
                audioPlayer={audioPlayer}
            />

            {isListEnded ? null : <ZButton
                title={"Load more"}
                onClick={loadMore}
            />}
        </div>
    )
}

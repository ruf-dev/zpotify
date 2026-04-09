import {useEffect, useState} from "react";
import {SongBase} from "@/app/api/zpotify";

import cls from "@/widgets/TrackList/TrackListWidget.module.css"

import {AudioPlayer} from "@/hooks/player/player.ts";
import {SongListPermissions} from "@/model/User.ts";

import SongListItem from "@/components/song/SongListItem.tsx";

type SongListWidgetProps = {
    songs: SongBase[]
    permissions?: SongListPermissions
    audioPlayer: AudioPlayer
}

export default function SongListWidget({songs, audioPlayer}: SongListWidgetProps) {
    const [currentSongIdx, setCurrentSongIdx] =
        useState<number>(-1);

    const [menuOpenedSongId, setMenuOpenedSongId] = useState<string | null>(null)

    useEffect(() => {
        if (!songs) return

        const uId = songs.findIndex((s) => s.filePath == audioPlayer.songUrl)
        if (uId == -1) return;

        setCurrentSongIdx(uId);
    }, [audioPlayer.songUrl, songs]);

    function getNext(currentIdx: number): string | undefined {
        if (songs.length == 0 || currentIdx == -1) {
            return
        }

        if (currentIdx < 0 || currentIdx + 1 >= songs.length) {
            return songs[0].filePath;
        }

        return songs[currentIdx + 1].filePath;
    }

    function getPrev(currentIdx: number): string | undefined {
        if (songs.length == 0 || currentIdx == -1) {
            return
        }

        if (currentIdx === 0) {
            return songs[songs.length - 1].filePath;
        }

        return songs[currentIdx - 1].filePath;
    }

    useEffect(() => {
        const currentSongIdx = songs
            .findIndex((s) => s.filePath == audioPlayer.songUrl)
        audioPlayer.setNext(getNext(currentSongIdx))
        audioPlayer.setPrev(getPrev(currentSongIdx))
    }, [audioPlayer.songUrl]);

    function playSongAtIndex(idx: number) {
        const song = songs[idx];
        if (!song) return;

        if (!song.filePath) throw "No song url path";

        audioPlayer.play(song.filePath);

        setCurrentSongIdx(idx);

        audioPlayer.onEnd(() => {
            const nextSongId = getNext(idx);
            if (nextSongId) {
                const nextIdx = songs.findIndex(s => s.id === nextSongId);
                playSongAtIndex(nextIdx);
            }

            return nextSongId
        });
    }

    return (
        <div className={cls.SongListWidgetContainer}>
            {songs.map((s: SongBase, idx: number) => (
                <div
                    key={s.id}
                    className={cls.Song}
                    onClick={() => playSongAtIndex(idx)}
                >
                    <SongListItem
                        song={s}

                        isPlaying={audioPlayer.isPlaying && audioPlayer.songUrl === s.id}
                        isSelected={currentSongIdx === idx}

                        onMenuOpened={setMenuOpenedSongId}
                        onMenuClosed={() => setMenuOpenedSongId(null)}
                        isInteractionDisabled={menuOpenedSongId ? menuOpenedSongId !== s.id : false}
                    />
                </div>
            ))}
        </div>
    );
}

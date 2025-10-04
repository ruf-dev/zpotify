import {useEffect, useState} from "react";

import cls from "@/widgets/TrackList/TrackListWidget.module.css"

import SongListItem from "@/components/song/SongListItem.tsx";

import {Song} from "@/model/Song.ts";
import {AudioPlayer} from "@/hooks/player/player.ts";

type SongListWidgetProps = {
    songs: Song[]
    audioPlayer: AudioPlayer
}

export default function SongListWidget({songs, audioPlayer}: SongListWidgetProps) {
    const [currentSongIdx, setCurrentSongIdx] =
        useState<number>(-1);

    const [menuOpenedSongId, setMenuOpenedSongId] = useState<string | null>(null)

    useEffect(() => {
        if (!songs) return

        const uId = songs.findIndex((s) => s.uniqueId == audioPlayer.songUniqueId)
        if (uId == -1) return;

        setCurrentSongIdx(uId);
    }, [audioPlayer.songUniqueId, songs]);

    function getNext(currentIdx: number): string | undefined {
        if (songs.length == 0 || currentIdx == -1) {
            return
        }

        if (currentIdx < 0 || currentIdx + 1 >= songs.length) {
            return songs[0].uniqueId;
        }

        return songs[currentIdx + 1].uniqueId;
    }

    function getPrev(currentIdx: number): string | undefined {
        if (songs.length == 0 || currentIdx == -1) {
            return
        }

        if (currentIdx === 0) {
            return songs[songs.length - 1].uniqueId;
        }

        return songs[currentIdx - 1].uniqueId;
    }

    useEffect(() => {
        const currentSongIdx = songs
            .findIndex((s) => s.uniqueId == audioPlayer.songUniqueId)
        audioPlayer.setNext(getNext(currentSongIdx))
        audioPlayer.setPrev(getPrev(currentSongIdx))
    }, [audioPlayer.songUniqueId]);

    function playSongAtIndex(idx: number) {
        const song = songs[idx];
        if (!song) return;

        audioPlayer.play(song.uniqueId);

        setCurrentSongIdx(idx);

        audioPlayer.onEnd(() => {
            const nextSongId = getNext(idx);
            if (nextSongId) {
                const nextIdx = songs.findIndex(s => s.uniqueId === nextSongId);
                playSongAtIndex(nextIdx);
            }

            return nextSongId
        });
    }

    return (
        <div className={cls.SongListWidgetContainer}>
            {songs.map((s: Song, idx: number) => (
                <div
                    key={s.uniqueId}
                    className={cls.Song}
                    onClick={() => playSongAtIndex(idx)}
                >
                    <SongListItem
                        song={s}
                        isPlaying={audioPlayer.isPlaying && audioPlayer.songUniqueId === s.uniqueId}
                        isSelected={currentSongIdx === idx}
                        onMenuOpened={setMenuOpenedSongId}
                        onMenuClosed={() => setMenuOpenedSongId(null)}
                        isInteractionDisabled={menuOpenedSongId ? menuOpenedSongId !== s.uniqueId : false}
                    />
                </div>
            ))}
        </div>
    );
}

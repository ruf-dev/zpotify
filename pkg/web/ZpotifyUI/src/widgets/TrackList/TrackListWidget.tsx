import cls from "@/widgets/TrackList/TrackListWidget.module.css"

import {Song} from "@/model/Song.ts";
import SongListItem from "@/components/song/SongListItem.tsx";
import {AudioPlayer} from "@/hooks/player/player.ts";
import {useState} from "react";

type SongListWidgetProps = {
    songs: Song[]
    audioPlayer: AudioPlayer
    currentlyPlayingIdx?: number;
}

export default function SongListWidget({songs, audioPlayer, currentlyPlayingIdx}: SongListWidgetProps) {
    const [currentSongIdx, setCurrentSongIdx]
        = useState<number>(currentlyPlayingIdx || 0);

    function getNext(): string | undefined {
        if (songs.length == currentSongIdx) {
            return undefined
        }

        const uniqueId =  songs[currentSongIdx+1].uniqueId;

        setCurrentSongIdx(currentSongIdx+1)

        return uniqueId
    }

    return (
        <div className={cls.SongListWidgetContainer}> {
            songs.map((s: Song) =>
                (
                    <div
                        key={s.uniqueId}
                        className={cls.Song}
                        onClick={() => {
                            audioPlayer.play(s.uniqueId)
                            audioPlayer.onEnd(getNext)
                        }}
                    >
                        <SongListItem
                            song={s}
                            isPlaying={audioPlayer.isPlaying}
                            isSelected={audioPlayer.songUniqueId == s.uniqueId}
                        />
                    </div>))
        } </div>
    );
}

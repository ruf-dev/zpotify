import cls from "@/widgets/TrackList/TrackListWidget.module.css"

import {Song} from "@/model/Song.ts";
import SongListItem from "@/components/song/SongListItem.tsx";
import {AudioPlayer} from "@/hooks/player/player.ts";

type SongListWidgetProps = {
    songs: Song[]
    audioPlayer: AudioPlayer
}

export default function SongListWidget({songs, audioPlayer}: SongListWidgetProps) {
    return (
        <div className={cls.SongListWidget}> {
            songs.map((s: Song) =>
                (
                    <div
                        key={s.uniqueId}
                        className={cls.Song}
                        onClick={() => audioPlayer.play(s.uniqueId)}
                    >
                        <SongListItem
                            song={s}/>
                    </div>))
        } </div>
    );
}

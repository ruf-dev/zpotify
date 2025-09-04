import cls from "@/components/song/SongListItem.module.css";

import {Song} from "@/model/Song.ts";

type SongItemProp = {
    song: Song
}

export default function SongItem({song}: SongItemProp) {
    return (
        <div className={cls.SongItem}>
            <div className={cls.Titles}>
                <div className={cls.Title}>
                    {song.title}
                </div>
                <div className={cls.Artists}>
                    {song.artistsNames.join(", ")}
                </div>
            </div>
            <div className={cls.Duration}>
                <div>{song.duration}</div>
            </div>
        </div>
    );
};

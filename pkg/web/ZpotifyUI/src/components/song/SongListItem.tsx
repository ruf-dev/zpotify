import cn from "classnames";

import cls from "@/components/song/SongListItem.module.scss";

import {Song} from "@/model/Song.ts";

type SongItemProp = {
    song: Song
    isSelected: boolean;
    isPlaying: boolean;
}

export default function SongItem({song, isPlaying, isSelected}: SongItemProp) {
    return (
        <div className={cn(cls.SongItem, {
            [cls.isPlaying]: isPlaying,
            [cls.isSelected]: isSelected
        })}>
            <div className={cls.Titles}>
                <div className={cn(cls.Title, {
                    [cls.isSelected]: isSelected,
                })}>
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

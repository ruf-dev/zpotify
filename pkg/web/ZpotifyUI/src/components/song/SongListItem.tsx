import cn from "classnames";

import cls from "@/components/song/SongListItem.module.scss";

import {Song} from "@/model/Song.ts";

import MoreButton from "@/components/song/more/MoreButton.tsx";
import {useState} from "react";

type SongItemProp = {
    song: Song
    isSelected: boolean;
    isPlaying: boolean;
}

export default function SongItem({song, isPlaying, isSelected}: SongItemProp) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={cn(cls.SongItem, {
                [cls.isPlaying]: isPlaying,
            })}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={cls.Titles}>
                <div className={cn(cls.Title, {
                    [cls.isSelected]: isHovered || isSelected,
                })}>
                    {song.title}
                </div>
                <div className={cls.Artists}>
                    {song.artistsNames.join(", ")}
                </div>
            </div>

            <div className={cn(cls.MoreDotsWrapper, {
                [cls.visible]: isHovered,
            })}>
                <MoreButton/>
            </div>

            <div className={cls.Duration}>
                <div>{song.duration}</div>
            </div>
        </div>
    );
};

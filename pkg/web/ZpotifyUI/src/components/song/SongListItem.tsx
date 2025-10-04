import cn from "classnames";

import cls from "@/components/song/SongListItem.module.scss";

import {Song} from "@/model/Song.ts";

import MoreButton from "@/components/song/more/MoreButton.tsx";
import {useEffect, useState} from "react";

type SongItemProp = {
    song: Song
    isSelected: boolean;
    isPlaying: boolean;

    isInteractionDisabled: boolean;

    onMenuOpened?: (songUniqueId: string) => void
    onMenuClosed?: () => void
}

export default function SongItem({
                                     song,
                                     isPlaying, isSelected,
                                     onMenuOpened, onMenuClosed,
                                     isInteractionDisabled,
                                 }: SongItemProp) {
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (isMenuOpen && onMenuOpened) onMenuOpened(song.uniqueId)

        if (!isMenuOpen && onMenuClosed) onMenuClosed()
    }, [isMenuOpen]);

    return (
        <div
            className={cn(cls.SongItem, {
                [cls.isPlaying]: isPlaying && !isInteractionDisabled,
                [cls.hovered]: (isMenuOpen || isHovered) && !isInteractionDisabled,
            })}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={cls.Titles}>
                <div className={cn(cls.Title, {
                    [cls.isSelected]: (isHovered || isSelected || isMenuOpen) && !isInteractionDisabled,
                })}>
                    {song.title}
                </div>
                <div className={cls.Artists}>
                    {song.artistsNames.join(", ")}
                </div>
            </div>

            {(isHovered || isMenuOpen) && !isInteractionDisabled ? (
                <div className={cls.MoreDotsWrapper}>
                    <MoreButton
                        onOpen={() => setIsMenuOpen(true)}
                        onClose={() => setIsMenuOpen(false)}
                    />
                </div>
            ) : (
                <div className={cls.Duration}>
                    <div>{song.duration}</div>
                </div>
            )}


        </div>
    );
};

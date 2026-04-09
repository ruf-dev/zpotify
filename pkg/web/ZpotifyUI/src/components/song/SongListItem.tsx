import cn from "classnames";
import {useEffect, useState} from "react";
import {SongBase} from "@/app/api/zpotify";

import cls from "@/components/song/SongListItem.module.scss";

import {SongListPermissions} from "@/model/User.ts";

import MoreButton from "@/components/song/more/MoreButton.tsx";
import {formatDuration} from "@/utils/time.ts";

type SongItemProp = {
    song: SongBase
    isSelected: boolean;
    isPlaying: boolean;

    isInteractionDisabled: boolean;

    onMenuOpened?: (songId: string) => void
    onMenuClosed?: () => void

    permissions?: SongListPermissions
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
        if (!song.id) throw new Error("song id must be provided");


        if (isMenuOpen && onMenuOpened) onMenuOpened(song.id)

        if (!isMenuOpen && onMenuClosed) onMenuClosed()
    }, [isMenuOpen]);

    const menuOps = [
        {
            label: "Delete",
            onClick: () => console.log("Delete"),
            disabled: true,//!permissions.canDelete,
        },
    ]

    function isItemSelected(): boolean {
        return (isHovered || isSelected || isMenuOpen) && !isInteractionDisabled
    }

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
                    [cls.isSelected]: isItemSelected(),
                })}>
                    {song.title}
                </div>
                <div className={cls.Artists}>
                    {song.artists?.map((a) => a.name).join(", ")}
                </div>
            </div>

            {(isHovered || isMenuOpen) && !isInteractionDisabled ? (
                <div className={cls.MoreDotsWrapper}>
                    <MoreButton
                        ops={menuOps}
                        onOpen={() => setIsMenuOpen(true)}
                        onClose={() => setIsMenuOpen(false)}
                    />
                </div>
            ) : (
                <div className={cls.Duration}>
                    <div>{formatDuration(song.durationSec ?? 0)}</div>
                </div>
            )}
        </div>
    );
};

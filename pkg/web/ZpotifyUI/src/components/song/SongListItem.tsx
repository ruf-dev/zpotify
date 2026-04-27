import cn from "classnames";
import {useState} from "react";
import {SongBase} from "@/app/api/zpotify";

import cls from "@/components/song/SongListItem.module.scss";

import {SongListPermissions} from "@/model/User.ts";

import MoreButton from "@/components/song/more/MoreButton.tsx";
import {formatDuration} from "@/utils/time.ts";
import NowPlayingBars from "@/assets/icons/NowPlayingBars.tsx";
import {useDialog} from "@/app/hooks/Dialog.tsx";
import EditTrackDialog from "@/dialogs/EditTrack/EditTrackDialog.tsx";

type SongItemProp = {
    song: SongBase
    num?: number
    isSelected: boolean;
    isPlaying: boolean;

    isInteractionDisabled: boolean;

    onMenuOpened?: (songId: string) => void
    onMenuClosed?: () => void

    permissions?: SongListPermissions
}

export default function SongItem({
                                     song,
                                     num,
                                     isPlaying, isSelected,
                                     onMenuOpened, onMenuClosed,
                                     isInteractionDisabled,
                                 }: SongItemProp) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const {OpenDialog} = useDialog();

    function handleMenuOpen() {
        setIsMenuOpen(true);
        if (song.id && onMenuOpened) onMenuOpened(song.id);
    }

    function handleMenuClose() {
        setIsMenuOpen(false);
        if (onMenuClosed) onMenuClosed();
    }

    const menuOps = [
        {
            label: "Edit",
            onClick: () => OpenDialog(<EditTrackDialog song={song}/>),
        },
        {
            label: "Delete",
            onClick: () => console.log("Delete"),
            disabled: true,
        },
    ]

    const active = isSelected && !isInteractionDisabled;

    return (
        <div
            className={cn(cls.SongItemContainer, {
                [cls.isPlaying]: active,
                [cls.menuOpen]: isMenuOpen,
            })}
        >
            <div className={cls.NumColumn}>
                {isPlaying && active ? (
                    <NowPlayingBars/>
                ) : (
                    <span className={cls.TrackNum}>{num}</span>
                )}
            </div>

            <div className={cls.Titles}>
                <div className={
                    cn(cls.Title, {
                        [cls.isPlaying]: active,
                    })}>
                    {song.title}
                </div>
                <div className={cls.Artists}>
                    {song.artists?.map((a) => a.name).join(", ")}
                </div>
            </div>

            <div className={cls.Duration}>
                {formatDuration(song.durationSec ?? 0)}
            </div>

            <div className={cls.MoreDotsWrapper}>
                <MoreButton
                    ops={menuOps}
                    onOpen={handleMenuOpen}
                    onClose={handleMenuClose}
                />
            </div>
        </div>
    );
}

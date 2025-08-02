
import cn from 'classnames';

import cls from "@/components/player/buttons/PlayPauseButton.module.css";

export interface PlayPauseButtonProps {
    isPlaying: boolean;

    onClick: () => void;
}

export default function PlayPauseButton({isPlaying, onClick}: PlayPauseButtonProps) {
    return (
        <div
            className={cls.PlayPauseWrapper}
            onClick={onClick}
        >
            <div className={
                cn(cls.Stick, cls.Stick1, {
                    [cls.Active]: isPlaying,
                    [cls.Inactive]: !isPlaying
                })
            }/>

            <div className={
                cn(cls.Stick, cls.Stick2, {
                    [cls.Active]: isPlaying,
                    [cls.Inactive]: !isPlaying
                })
            }/>

            <div className={
                cn(cls.Stick, cls.Stick3, {
                    [cls.Active]: isPlaying,
                    [cls.Inactive]: !isPlaying
                })
            }/>

        </div>
    )
}

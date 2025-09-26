import cn from 'classnames';

import cls from "@/components/player/buttons/PlayPauseButton.module.scss";

export interface PlayPauseButtonProps {
    isPlaying: boolean,
    onClick: () => void,
    isDisabled?: boolean
}

export default function PlayPauseButton({isPlaying, onClick, isDisabled}: PlayPauseButtonProps) {
    return (
        <div
            className={cn(cls.PlayPauseWrapper, {
                [cls.Disabled]: isDisabled
            })}
            onClick={onClick}
        >
            <div className={cls.InnerTriangleWrapper}>
                <div className={cn(cls.InnerTriangle, {
                    [cls.Active]: isPlaying,
                    [cls.Disabled]: isDisabled
                })}/>
            </div>

            <div className={
                cn(cls.Stick, cls.Stick1, {
                    [cls.Active]: isPlaying,
                    [cls.Inactive]: !isPlaying,
                    [cls.Disabled]: isDisabled
                })
            }/>

            <div className={
                cn(cls.Stick, cls.Stick2, {
                    [cls.Active]: isPlaying,
                    [cls.Inactive]: !isPlaying,
                    [cls.Disabled]: isDisabled
                })
            }/>

            <div className={
                cn(cls.Stick, cls.Stick3, {
                    [cls.Active]: isPlaying,
                    [cls.Inactive]: !isPlaying,
                    [cls.Disabled]: isDisabled
                })
            }/>

        </div>
    )
}

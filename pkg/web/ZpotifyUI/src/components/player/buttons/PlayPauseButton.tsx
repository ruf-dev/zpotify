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
            className={cn(cls.PlayPauseWrapper, {[cls.Disabled]: isDisabled})}
            onClick={onClick}
        >
            {isPlaying ? (
                <svg className={cls.Icon} viewBox="0 0 24 24" fill="black">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
            ) : (
                <svg className={cn(cls.Icon, cls.PlayIcon)} viewBox="0 0 24 24" fill="black">
                    <polygon points="5 3 19 12 5 21"/>
                </svg>
            )}
        </div>
    )
}
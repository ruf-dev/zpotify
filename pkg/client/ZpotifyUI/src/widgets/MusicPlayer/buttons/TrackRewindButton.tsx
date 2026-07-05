import cn from 'classnames';

import cls from '@/widgets/MusicPlayer/buttons/TrackRewindButton.module.css';

export interface TrackRewindButton {
    next?: boolean;
    previous?: boolean;
    onClick: () => void;
    isDisabled?: boolean;
}

export default function TrackRewindButton({ previous, onClick, isDisabled }: TrackRewindButton) {
    return (
        <div
            className={cn(cls.TrackRewindContainer, {
                [cls.isDisabled]: isDisabled,
            })}
            onClick={onClick}
        >
            <svg style={{ transform: previous ? 'scaleX(-1)' : 'none' }} viewBox="0 0 32 32" width="14" height="14">
                <rect x="18" y="9" width="5" height="14" fill="currentColor" />
                <polygon points="9,9 9,23 18,16" fill="currentColor" />
            </svg>
        </div>
    );
}

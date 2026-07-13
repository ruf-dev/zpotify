import { Button } from '@vervstack/chures';

import cls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/PlayButton/PlayButton.module.css';
import PlayIcon from '@/assets/icons/PlayIcon.tsx';
import PauseIcon from '@/assets/icons/PauseIcon.tsx';

export interface PlayButtonProps {
    onClick: () => void;
    isPlaying?: boolean;
}

export default function PlayButton({ onClick, isPlaying }: PlayButtonProps) {
    return (
        <Button
            variant="unstyled"
            className={cls.PlayButton}
            aria-label={isPlaying ? 'Pause' : 'Play album'}
            onClick={onClick}
        >
            {isPlaying ? <PauseIcon /> : <PlayIcon className={cls.PlayIcon} />}
        </Button>
    );
}

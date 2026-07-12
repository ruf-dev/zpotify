import { Button } from '@vervstack/chures';

import cls from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/PlayButton/PlayButton.module.css';
import PlayIcon from '@/assets/icons/PlayIcon.tsx';

export interface PlayButtonProps {
    onClick: () => void;
}

export default function PlayButton({ onClick }: PlayButtonProps) {
    return (
        <Button variant="unstyled" className={cls.PlayButton} aria-label="Play album" onClick={onClick}>
            <PlayIcon className={cls.PlayIcon} />
        </Button>
    );
}

import cls from '@/widgets/MusicPlayer/buttons/ShuffleTracksButton.module.css';
import ShuffleArrowSVG from '@/assets/player/ShuffleArrows.tsx';
import { AudioPlayer } from '@/widgets/MusicPlayer/usePlayer.ts';

interface ShuffleTracksButtonProps {
    audioPlayer: AudioPlayer;
}

export default function ShuffleTracksButton({ audioPlayer }: ShuffleTracksButtonProps) {
    return (
        <div className={cls.ShuffleTracksButtonContainer} onClick={() => audioPlayer.setShuffleHash(Date.now())}>
            <ShuffleArrowSVG />
        </div>
    );
}

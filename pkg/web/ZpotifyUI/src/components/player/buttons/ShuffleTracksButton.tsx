import cls from "@/components/player/buttons/ShuffleTracksButton.module.scss";
import ShuffleArrowSVG from "@/assets/player/ShuffleArrows.tsx";
import {AudioPlayer} from "@/hooks/player/player.ts";

interface ShuffleTracksButtonProps {
    audioPlayer: AudioPlayer;
}

export default function ShuffleTracksButton({audioPlayer}: ShuffleTracksButtonProps) {
    return (
        <div
            className={cls.ShuffleTracksButtonContainer}
            onClick={() => audioPlayer.setShuffleHash(Date.now())}
        >
            <ShuffleArrowSVG/>
        </div>
    )
}

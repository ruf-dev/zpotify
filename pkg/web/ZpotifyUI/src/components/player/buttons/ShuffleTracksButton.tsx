import cls from "@/components/player/buttons/ShuffleTracksButton.module.scss";
import ShuffleArrowSVG from "@/assets/player/ShuffleArrows.tsx";

interface ShuffleTracksButtonProps {
    onClick: () => void;
}

export default function ShuffleTracksButton({onClick}: ShuffleTracksButtonProps) {
    return (
        <div
            className={cls.ShuffleTracksButtonContainer}
            onClick={onClick}
        >
            <ShuffleArrowSVG/>
        </div>
    )
}

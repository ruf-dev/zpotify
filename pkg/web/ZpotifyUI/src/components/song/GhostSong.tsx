
import cls from "@/components/song/GhostSong.module.css";

interface GhostSongProps {
    onClick?: () => void;
}

export default function GhostSong({onClick}: GhostSongProps) {
    return (
        <div
            className={cls.GhostSong}
            onClick={onClick}
        >
            + Add song
        </div>
    )
}

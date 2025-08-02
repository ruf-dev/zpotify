import {useState} from "react";

export default function useAudioPlayer() {
    const [audio] = useState(() => new Audio());

    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = (trackUrl: string | undefined): boolean => {
        if (trackUrl && audio.src != trackUrl) {
            audio.src = trackUrl;
        }

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            audio.play().catch((err) => {
                console.log(err)
                // setIsPlaying(false)
            });
        }

        return isPlaying
    }

    return {
        isPlaying,
        togglePlay,
    }
}

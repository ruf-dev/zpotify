import {AudioPlayer} from "@/processes/player/player.ts";
import PlayerControls from "@/components/player/PlayerControls.tsx";

interface HomePageProps {
    AudioPlayer: AudioPlayer
}

export default function HomePage({AudioPlayer}: HomePageProps) {
    return (
        <div>
            <PlayerControls
                isPlaying={AudioPlayer.isPlaying}
                togglePlay={() => {}}
            />
        </div>
    )
}

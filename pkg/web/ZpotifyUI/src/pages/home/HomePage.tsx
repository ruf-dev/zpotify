import {useEffect} from "react";
import {useNavigate} from "react-router-dom";

import {AudioPlayer} from "@/processes/player/player.ts";
import {User} from "@/processes/user/user.ts";

import PlayerControls from "@/components/player/PlayerControls.tsx";
import TelegramCustomLoginButton from "@/components/auth/TelegramAuth.tsx";
import {Path} from "@/app/routing/Router.tsx";

interface HomePageProps {
    audioPlayer: AudioPlayer
    user?: User
}

export default function HomePage({audioPlayer, user}: HomePageProps) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate(Path.IntiPage)
        }
    }, []);


    return (
        <div>
            <PlayerControls
                isPlaying={audioPlayer.isPlaying}
                togglePlay={() => {}}
            />
            <TelegramCustomLoginButton/>
        </div>
    )
}

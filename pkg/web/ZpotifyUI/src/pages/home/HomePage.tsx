import cls from "@/pages/home/HomePage.module.css"

import { useEffect} from "react";
import {useNavigate} from "react-router-dom";

import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/user.ts";

import {Path} from "@/app/routing/Router.tsx";
import HeaderPart from "@/parts/header/HeaderPart.tsx";

interface HomePageProps {
    audioPlayer: AudioPlayer
    user: User
}

export default function HomePage({user}: HomePageProps) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!user.userData) {
            navigate(Path.IntiPage)
        }
    }, [user.userData]);

    return (
        <div className={cls.HomePage}>
            <HeaderPart user={user}/>

        </div>
    )
}

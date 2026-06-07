import {Outlet, useNavigate} from 'react-router-dom';
import cls from '@/app/layouts/MainLayout.module.css'
import useUser from "@/entities/user/useUser.ts";
import {useEffect} from "react";
import {Path} from "@/app/routing/paths.ts";
import HeaderPart from "@/widgets/Header/HeaderPart.tsx";
import MusicPlayerWithLogo from "@/widgets/MusicPlayer/MusicPlayerWithLogo.tsx";
import useAudioPlayer from "@/widgets/MusicPlayer/usePlayer.ts";

export default function MainLayout() {
    const userData = useUser((state) => state.userData);
    const audioPlayer = useAudioPlayer();
    const navigate = useNavigate();

    useEffect(() => {
        if (!userData) {
            navigate(Path.IntiPage);
        }
    }, [userData]);

    return (
        <div className={cls.MainLayoutContainer}>
            <Outlet/>

            <div className={cls.Header}>
                <HeaderPart/>
            </div>
            <div className={cls.Player}>
                <MusicPlayerWithLogo audioPlayer={audioPlayer}/>
            </div>
        </div>
    );
}

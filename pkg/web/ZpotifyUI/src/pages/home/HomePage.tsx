import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import cls from "@/pages/home/HomePage.module.css"

import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/User.ts";
import {Path} from "@/app/routing/Router.tsx";

import HeaderPart from "@/parts/header/HeaderPart.tsx";
import MusicPlayerWithLogo from "@/components/player/MusicPlayerWithLogo.tsx";
import Carousel from "@/components/carousel/Carousel.tsx";
import {HomeSegment, HomeSegmentProps} from "@/model/HomeSegments.tsx";
import {useToaster} from "@/hooks/toaster/ToasterZ.ts";

interface HomePageProps {
    audioPlayer: AudioPlayer
    user: User
}

export default function HomePage({user, audioPlayer}: HomePageProps) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!user.userData) {
            navigate(Path.IntiPage)
        }
    }, [user.userData]);

    if (!user.userData) {
        return (<div>loading</div>)
    }

    const [segments, setSegments] = useState<HomeSegment[]>([]);

    const toaster = useToaster();

    useEffect(() => {
        user
            .Services()
            .Settings()
            .ListHomeSegments()
            .then(setSegments)
            .catch(toaster.catch)
    }, [])

    const homePageProps: HomeSegmentProps = {
        audioPlayer: audioPlayer,
        user: user,
    } as HomeSegmentProps

    return (
        <div className={cls.HomePage}>
            <div className={cls.MainBody}>
                <Carousel>
                    {segments.map(s => {
                        return (
                            <div className={cls.Section}>
                                {s.buildComponent(homePageProps)}
                            </div>
                        )
                    })}
                </Carousel>
            </div>

            <div className={cls.Header}>
                <HeaderPart
                    user={user}/>
            </div>

            <div className={cls.Player}>
                <MusicPlayerWithLogo
                    audioPlayer={audioPlayer}
                />
            </div>
        </div>
    )
}

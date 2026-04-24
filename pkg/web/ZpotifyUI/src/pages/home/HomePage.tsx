import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import cls from "@/pages/home/HomePage.module.css"

import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/User.ts";
import {Path} from "@/app/routing/Router.tsx";

import HeaderPart from "@/parts/header/HeaderPart.tsx";
import MusicPlayerWithLogo from "@/components/player/MusicPlayerWithLogo.tsx";
import {HomeSegment, HomeSegmentProps, PlaylistSegmentInfo} from "@/model/HomeSegments.tsx";
import {useToaster} from "@/hooks/toaster/ToasterZ.ts";
import SegmentTabBar, {Tab} from "@/components/tabs/SegmentTabBar.tsx";
import SegmentCarousel from "@/components/carousel/SegmentCarousel.tsx";

const HOME_TABS: Tab[] = [
    {id: 'tracks',    label: 'tracks'},
    {id: 'playlists', label: 'playlists'},
    {id: 'recent',    label: 'recent'},
    {id: 'artists',   label: 'artists'},
];

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

    const savedIdx = parseInt(localStorage.getItem('zp_tab_idx') || '0', 10);
    const [activeIdx, setActiveIdx] = useState(!isNaN(savedIdx) && savedIdx < HOME_TABS.length ? savedIdx : 0);
    const [segments, setSegments] = useState<HomeSegment[]>([]);
    const toaster = useToaster();

    const handleChange = (idx: number) => {
        setActiveIdx(idx);
        localStorage.setItem('zp_tab_idx', String(idx));
    };

    const handleTabClick = (id: string) => {
        const idx = HOME_TABS.findIndex(t => t.id === id);
        if (idx >= 0) handleChange(idx);
    };

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

    function renderSlide(idx: number): React.ReactNode {
        const tab = HOME_TABS[idx];
        switch (tab.id) {
            case 'playlists': {
                const segment = segments.find(s => s instanceof PlaylistSegmentInfo);
                return segment
                    ? segment.buildComponent(homePageProps)
                    : <div className={cls.Empty}>No playlists configured</div>;
            }
            default:
                return <div className={cls.Empty}>Coming soon</div>;
        }
    }

    return (
        <div className={cls.HomePage}>
            <div className={cls.Header}>
                <HeaderPart user={user}/>
            </div>

            <div className={cls.ContentArea}>
                <SegmentTabBar
                    tabs={HOME_TABS}
                    activeId={HOME_TABS[activeIdx].id}
                    onChange={handleTabClick}
                />
                <SegmentCarousel
                    activeIdx={activeIdx}
                    count={HOME_TABS.length}
                    onChange={handleChange}
                    renderSlide={renderSlide}
                />
            </div>

            <div className={cls.Player}>
                <MusicPlayerWithLogo audioPlayer={audioPlayer}/>
            </div>
        </div>
    )
}

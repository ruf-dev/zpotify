import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";

import cls from "@/pages/home/HomePage.module.css"

import {AudioPlayer} from "@/widgets/MusicPlayer/usePlayer.ts";
import useUser from "@/entities/user/useUser.ts";
import {Path} from "@/app/routing/Router.tsx";

import HeaderPart from "@/widgets/Header/HeaderPart.tsx";
import MusicPlayerWithLogo from "@/widgets/MusicPlayer/MusicPlayerWithLogo.tsx";
import {HomeSegmentProps} from "@/shared/model/HomeSegments.tsx";
import SegmentTabBar from "@/components/tabs/SegmentTabBar.tsx";
import SegmentCarousel from "@/components/carousel/SegmentCarousel.tsx";
import {useHomeSegments} from "@/widgets/HomeSegments/useHomeSegments.ts";

interface HomePageProps {
    audioPlayer: AudioPlayer
}

export default function HomePage({audioPlayer}: HomePageProps) {
    const navigate = useNavigate();
    const userData = useUser(state => state.userData);
    const {segments, tabs, activeIdx, handleChange} = useHomeSegments();

    useEffect(() => {
        if (!userData) {
            navigate(Path.IntiPage);
        }
    }, [userData]);

    if (!userData) {
        return (<div>loading</div>);
    }

    const activeTab = tabs[activeIdx];

    function handleTabClick(id: string) {
        const idx = tabs.findIndex(t => t.id === id);
        if (idx >= 0) handleChange(idx);
    }

    const homePageProps: HomeSegmentProps = {
        audioPlayer: audioPlayer,
    };

    function renderSlide(idx: number): React.ReactNode {
        const segment = segments[idx];
        if (!segment) return null;
        return segment.buildComponent(homePageProps);
    }

    return (
        <div className={cls.HomePage}>
            <div className={cls.ContentArea}>
                {tabs.length > 0 && (
                    <SegmentTabBar
                        tabs={tabs}
                        activeId={activeTab?.id ?? ''}
                        onChange={handleTabClick}
                    />
                )}
                <SegmentCarousel
                    activeIdx={activeIdx}
                    count={segments.length}
                    onChange={handleChange}
                    renderSlide={renderSlide}
                />
            </div>

            <div className={cls.Header}>
                <HeaderPart/>
            </div>
            <div className={cls.Player}>
                <MusicPlayerWithLogo audioPlayer={audioPlayer}/>
            </div>
        </div>
    )
}

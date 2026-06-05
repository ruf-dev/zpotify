import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import cls from "@/pages/home/HomePage.module.css"

import {AudioPlayer} from "@/hooks/player/player.ts";
import useUser from "@/hooks/user/User.ts";
import {Path} from "@/app/routing/Router.tsx";

import HeaderPart from "@/widgets/Header/HeaderPart.tsx";
import MusicPlayerWithLogo from "@/components/player/MusicPlayerWithLogo.tsx";
import {HomeSegment, HomeSegmentProps} from "@/shared/model/HomeSegments.tsx";
import {useToaster} from "@/hooks/toaster/ToasterZ.ts";
import SegmentTabBar, {Tab} from "@/components/tabs/SegmentTabBar.tsx";
import SegmentCarousel from "@/components/carousel/SegmentCarousel.tsx";

interface HomePageProps {
    audioPlayer: AudioPlayer
}

export default function HomePage({audioPlayer}: HomePageProps) {
    const navigate = useNavigate();
    const toaster = useToaster();
    const [segments, setSegments] = useState<HomeSegment[]>([]);
    const savedIdx = parseInt(localStorage.getItem('zp_tab_idx') || '0', 10);
    const [activeIdx, setActiveIdx] = useState(!isNaN(savedIdx) ? savedIdx : 0);

    const userData = useUser(state => state.userData);
    const Services = useUser(state => state.Services);

    useEffect(() => {
        if (!userData) {
            navigate(Path.IntiPage);
        }
    }, [userData]);

    useEffect(() => {
        Services().Settings().ListHomeSegments()
            .then(setSegments)
            .catch(toaster.catch);
    }, []);

    useEffect(() => {
        if (segments.length > 0 && activeIdx >= segments.length) {
            setActiveIdx(0);
        }
    }, [segments]);

    if (!userData) {
        return (<div>loading</div>);
    }

    const tabs: Tab[] = segments.map(s => ({id: s.id, label: s.label}));
    const activeTab = tabs[activeIdx];

    const handleChange = (idx: number) => {
        setActiveIdx(idx);
        localStorage.setItem('zp_tab_idx', String(idx));
    };

    const handleTabClick = (id: string) => {
        const idx = tabs.findIndex(t => t.id === id);
        if (idx >= 0) handleChange(idx);
    };

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

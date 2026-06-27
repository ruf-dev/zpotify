import {Outlet, useNavigate} from 'react-router-dom';
import cn from 'classnames';
import cls from '@/app/layouts/MainLayout.module.css'
import useUser from "@/entities/user/useUser.ts";
import {useEffect} from "react";
import {Path} from "@/app/routing/paths.ts";
import HeaderPart from "@/widgets/Header/HeaderPart.tsx";
import MusicPlayerWithLogo from "@/widgets/MusicPlayer/MusicPlayerWithLogo.tsx";
import useAudioPlayer from "@/widgets/MusicPlayer/usePlayer.ts";
import {useUISettings} from "@/entities/ui-settings/useUISettings.ts";
import SidebarSegment from "@/pages/segments/SidebarSegment/SidebarSegment.tsx";
import PlayerBarSegment from "@/pages/segments/PlayerBarSegment/PlayerBarSegment.tsx";
import QueuePanelWidget from "@/widgets/QueuePanel/QueuePanelWidget.tsx";

export default function MainLayout() {
    const userData = useUser((state) => state.userData);
    const navigate = useNavigate();
    const showSidebar = useUISettings((state) => state.showSidebar);
    const showPlayerBar = useUISettings((state) => state.showPlayerBar);
    const showQueuePanel = useUISettings((state) => state.showQueuePanel);
    const audioPlayer = useAudioPlayer();

    useEffect(() => {
        if (!userData) {
            navigate(Path.IntiPage);
        }
    }, [userData]);

    return (
        <div className={cls.MainLayoutContainer}>
            <div className={cls.MainArea}>
                {showSidebar && <SidebarSegment/>}

                <div className={cls.CenterContent}>
                    <div className={cls.Content}>
                        <Outlet/>
                    </div>
                    <div className={cls.Header}>
                        <HeaderPart/>
                    </div>
                </div>
            </div>

            <div className={cn(cls.PlayerBarSpacer, showPlayerBar && cls.PlayerBarSpacerVisible)}/>
            <div className={cn(cls.PlayerBar, showPlayerBar && cls.PlayerBarVisible)}>
                <PlayerBarSegment/>
            </div>

            {!showPlayerBar && (
                <div className={cls.Player}>
                    <MusicPlayerWithLogo audioPlayer={audioPlayer}/>
                </div>
            )}

            {showQueuePanel && <QueuePanelWidget/>}
        </div>
    );
}

import { Outlet, useNavigate } from 'react-router-dom';
import cn from 'classnames';
import { useEffect } from 'react';

import cls from '@/app/layouts/MainLayout.module.css';
import useUser from '@/entities/user/useUser.ts';
import { Path } from '@/app/routing/paths.ts';
import HeaderPart from '@/widgets/Header/HeaderPart.tsx';
import MusicPlayerWithLogo from '@/widgets/MusicPlayer/MusicPlayerWithLogo.tsx';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';
import { useUISettings } from '@/entities/ui-settings/useUISettings.ts';
import { useSidebarUI } from '@/shared/model/sidebarUIStore.ts';
import SidebarSegment from '@/pages/segments/SidebarSegment/SidebarSegment.tsx';
import PlayerBarSegment from '@/pages/segments/PlayerBarSegment/PlayerBarSegment.tsx';
import MobileNavSegment from '@/pages/segments/MobileNavSegment/MobileNavSegment.tsx';

export default function MainLayout() {
    const userData = useUser((state) => state.userData);
    const navigate = useNavigate();
    const showSidebar = useUISettings((state) => state.showSidebar);
    const showPlayerBar = useUISettings((state) => state.showPlayerBar);
    const isSidebarCollapsed = useSidebarUI((state) => state.isCollapsed);

    const audioPlayer = useAudioPlayer();
    const effectiveShowPlayerBar = showPlayerBar && audioPlayer.trackPath !== null;

    useEffect(() => {
        if (!userData) {
            const path = window.location.pathname;
            if (path !== Path.HomePage && path !== Path.IntiPage) {
                sessionStorage.setItem('zpotify-return-path', path);
            }
            navigate(Path.IntiPage);
        }
    }, [userData]);

    return (
        <div className={cls.MainLayoutContainer}>
            <div className={cls.MainArea}>
                {showSidebar && (
                    <div className={cn(cls.SidebarSpacer, isSidebarCollapsed && cls.SidebarSpacerCollapsed)} />
                )}

                <div className={cls.CenterContent}>
                    <div className={cls.Content}>
                        <Outlet />
                    </div>
                    <div className={cls.Header}>
                        <HeaderPart />
                    </div>
                </div>

                {showSidebar && <SidebarSegment />}
            </div>

            <div className={cn(cls.PlayerBarSpacer, effectiveShowPlayerBar && cls.PlayerBarSpacerVisible)} />
            <div className={cls.MobileNavSpacer} />
            <div className={cn(cls.PlayerBar, effectiveShowPlayerBar && cls.PlayerBarVisible)}>
                <PlayerBarSegment />
            </div>

            <MobileNavSegment />

            {!showPlayerBar && (
                <div className={cls.Player}>
                    <MusicPlayerWithLogo audioPlayer={audioPlayer} />
                </div>
            )}
        </div>
    );
}

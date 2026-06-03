import {useEffect} from "react";
import {useNavigate} from "react-router-dom";

import cls from '@/pages/init/InitPage.module.css';

import ZLogoLanding from "@/pages/init/ZLogoLanding.tsx";
import LoginPasswordDialog from "@/dialogs/LoginViaPass/LoginViaPass.tsx";
import AuthButton from "@/components/shared/AuthButton.tsx";
import TelegramAuth from "@/components/auth/TelegramAuth.tsx";

import {Path} from "@/app/routing/Router.tsx";
import {useDialog} from "@/app/hooks/Dialog.tsx";

import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/User.ts";

import lockIcon from "@/assets/icons/lock.svg";
import googleIcon from "@/assets/icons/google.svg";
import appleIcon from "@/assets/icons/apple.svg";
import githubIcon from "@/assets/icons/github.svg";

interface InitPageProps {
    AudioPlayer: AudioPlayer;
    userState: User;
}

export default function InitPage({AudioPlayer, userState}: InitPageProps) {
    const navigate = useNavigate();
    const {OpenDialog} = useDialog();

    useEffect(() => {
        if (userState.userData) {
            navigate(Path.HomePage);
            AudioPlayer.unload();
        }
    }, [userState.userData]);

    useEffect(() => {
        if (userState.earlyAccessDenied) {
            navigate(Path.EarlyAccessPage);
        }
    }, [userState.earlyAccessDenied]);

    function openLogoPassDialog() {
        OpenDialog(<LoginPasswordDialog userState={userState}/>)
    }

    return (
        <div className={cls.InitPage}>
            <div className={cls.Glow}/>

            <div className={cls.Logo}>
                <ZLogoLanding/>
            </div>

            <div className={cls.AppName}>Zpotify</div>
            <div className={cls.Tagline}>Music your way</div>

            <div className={cls.Divider}/>

            <div className={cls.ActiveButtons}>
                <TelegramAuth userState={userState}/>
                <AuthButton
                    icon={<img src={lockIcon} width={16} height={16} alt=""/>}
                    label="Username & Password"
                    onClick={openLogoPassDialog}
                />
            </div>

            <div className={cls.ComingSoonButtons}>
                <AuthButton
                    icon={<img src={googleIcon} width={16} height={16} alt=""/>}
                    className={cls.NotReadyButton}
                    label="Google"
                    disabled
                    comingSoon/>
                <AuthButton
                    icon={<img src={appleIcon} width={16} height={16} alt=""/>}
                    className={cls.NotReadyButton}
                    label="Apple"
                    disabled
                    comingSoon/>
                <AuthButton
                    icon={<img src={githubIcon} width={16} height={16} alt=""/>}
                    className={cls.NotReadyButton}
                    label="GitHub"
                    disabled
                    comingSoon/>
            </div>

            <div className={cls.Footer}>self-hosted · open source</div>
        </div>
    );
}

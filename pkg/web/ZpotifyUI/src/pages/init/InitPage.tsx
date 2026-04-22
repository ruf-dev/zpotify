import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

import cls from '@/pages/init/InitPage.module.css';

import ZLogoLanding from "@/pages/init/ZLogoLanding.tsx";
import PasswordModal from "@/pages/init/PasswordModal.tsx";
import AuthButton from "@/components/shared/AuthButton.tsx";

import {Path} from "@/app/routing/Router.tsx";

import {AudioPlayer} from "@/hooks/player/player.ts";
import {User} from "@/hooks/user/User.ts";
import {AuthenticateViaTelegram, AuthResults} from "@/processes/AuthTelegram.ts";
import {TgDeeplink} from "@/common/Link.ts";

import telegramIcon from "@/assets/icons/telegram.svg";
import lockIcon from "@/assets/icons/lock.svg";
import googleIcon from "@/assets/icons/google.svg";
import appleIcon from "@/assets/icons/apple.svg";
import githubIcon from "@/assets/icons/github.svg";

interface InitPageProps {
    AudioPlayer: AudioPlayer;
    UserState: User;
}

export default function InitPage({AudioPlayer, UserState}: InitPageProps) {
    const trackId = `AgADBGcAAscmoEg`;
    const navigate = useNavigate();

    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        if (UserState.userData) {
            navigate(Path.HomePage);
            AudioPlayer.unload();
        } else {
            AudioPlayer.preload(trackId);
        }
    }, [UserState.userData]);

    function handleTelegramLogin() {
        const authProcess = AuthenticateViaTelegram();
        authProcess.subscribe((res: AuthResults) => {
            if (res.AuthUUID) {
                window.open(
                    TgDeeplink(`resolve?domain=${import.meta.env.VITE_TG_BOT_NAME}&start=auth_${res.AuthUUID}`),
                    "_blank"
                );
            }
            if (res.AuthData) {
                UserState.Authenticate(res.AuthData);
            }
        });
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
                <AuthButton
                    icon={<img src={telegramIcon} width={18} height={18} alt=""/>}
                    label="Continue with Telegram"
                    onClick={handleTelegramLogin}
                />
                <AuthButton
                    icon={<img src={lockIcon} width={16} height={16} alt=""/>}
                    label="Username & Password"
                    onClick={() => setShowPasswordModal(true)}
                />
            </div>

            <div className={cls.ComingSoonButtons}>
                <AuthButton icon={<img src={googleIcon} width={16} height={16} alt=""/>} label="Google" disabled comingSoon/>
                <AuthButton icon={<img src={appleIcon} width={16} height={16} alt=""/>} label="Apple" disabled comingSoon/>
                <AuthButton icon={<img src={githubIcon} width={16} height={16} alt=""/>} label="GitHub" disabled comingSoon/>
            </div>

            <div className={cls.Footer}>self-hosted · open source</div>

            {showPasswordModal && (
                <PasswordModal
                    userState={UserState}
                    onClose={() => setShowPasswordModal(false)}
                />
            )}
        </div>
    );
}

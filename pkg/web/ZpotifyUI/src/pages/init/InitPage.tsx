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

interface InitPageProps {
    AudioPlayer: AudioPlayer;
    UserState: User;
}

const TelegramIcon = () => (
    <svg width="18" height="18" viewBox="0 0 240 240" fill="none">
        <circle cx="120" cy="120" r="120" fill="#229ED9"/>
        <path d="M175 68L33 122c-9 3.5-8.8 8.5-1.6 10.7l35.5 11 82-51.6c3.8-2.4 7.3-1.1 4.4 1.5l-66.4 60h-.1l2.5 36.8c3.5 0 5-1.6 7-3.5l16.8-16.4 35 25.8c6.4 3.5 11 1.7 12.6-5.9l22.8-107.5c2.3-9.2-3.5-13.4-10.5-10.4z" fill="white"/>
    </svg>
);

const LockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);

const GoogleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" opacity="0.5"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" opacity="0.5"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" opacity="0.5"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" opacity="0.5"/>
    </svg>
);

const AppleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
);

const GithubIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
);

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

            <div className={cls.AppName}>zpotify</div>
            <div className={cls.Tagline}>your music, your server</div>

            <div className={cls.Divider}/>

            <div className={cls.ActiveButtons}>
                <AuthButton
                    icon={<TelegramIcon/>}
                    label="Continue with Telegram"
                    onClick={handleTelegramLogin}
                />
                <AuthButton
                    icon={<LockIcon/>}
                    label="Username & Password"
                    onClick={() => setShowPasswordModal(true)}
                />
            </div>

            <div className={cls.ComingSoonButtons}>
                <AuthButton icon={<GoogleIcon/>} label="Google" disabled comingSoon/>
                <AuthButton icon={<AppleIcon/>} label="Apple" disabled comingSoon/>
                <AuthButton icon={<GithubIcon/>} label="GitHub" disabled comingSoon/>
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

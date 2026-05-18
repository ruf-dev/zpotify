import {useRef, useEffect} from "react";

import cls from "@/components/auth/TelegramAuth.module.css"

import {User} from "@/hooks/user/User.ts";
import {AuthViaTelegram} from "@/processes/Auth.ts";

interface TelegramAuthProps {
    userState: User
}

export default function TelegramAuth({userState}: TelegramAuthProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(function () {
        if (!containerRef.current) return;

        (window as unknown as Record<string, unknown>).onTelegramAuth = function (data: { id_token: string }) {
            AuthViaTelegram(data.id_token)
                .then(function (authData) {
                    userState.Authenticate(authData);
                })
                .catch(function (err: unknown) {
                    alert(err instanceof Error ? err.message : "Telegram login failed");
                });
        };

        const script = document.createElement("script");
        script.src = "https://oauth.telegram.org/js/telegram-login.js?3";
        script.setAttribute("data-client-id", import.meta.env.VITE_TELEGRAM_CLIENT_ID ?? "");
        script.setAttribute("data-size", "large");
        script.setAttribute("data-onauth", "onTelegramAuth(data)");
        script.setAttribute("data-request-access", "write");
        script.async = true;
        containerRef.current.appendChild(script);

        return function () {
            delete (window as unknown as Record<string, unknown>).onTelegramAuth;
        };
    }, []);

    return (
        <div className={cls.TelegramAuth}>
            <div ref={containerRef} className={cls.WidgetContainer}/>
            <button className="tg-auth-button" data-style="shine">Sign In via Telegram</button>
        </div>
    );
}

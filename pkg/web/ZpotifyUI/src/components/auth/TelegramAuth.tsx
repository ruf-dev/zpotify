import {useTelegramLogin, TelegramAuthData} from "@vervstack/chures";

import telegramIcon from "@/assets/icons/telegram.svg";
import AuthButton from "@/components/shared/AuthButton.tsx";
import cls from "@/components/auth/TelegramAuth.module.css";
import {User} from "@/hooks/user/User.ts";
import {AuthViaTelegram} from "@/processes/Auth.ts";

interface TelegramAuthProps {
    userState: User
}

export default function TelegramAuth({userState}: TelegramAuthProps) {
    const botId = import.meta.env.VITE_TELEGRAM_CLIENT_ID ?? "";

    function handleSuccess(data: TelegramAuthData) {
        AuthViaTelegram(data.id_token)
            .then(function (authData) {
                userState.Authenticate(authData);
            })
            .catch(function (err: unknown) {
                alert(err instanceof Error ? err.message : "Telegram login failed");
            });
    }

    const {login, isReady, isLoading} = useTelegramLogin({botId, onSuccess: handleSuccess});

    return (
        <AuthButton
            icon={<img src={telegramIcon}
                       className={cls.TelegramIcon} alt=""/>}
            label="Use Telegram"
            onClick={login}
            disabled={!isReady || isLoading}
            className={cls.TelegramButton}
        />
    );
}

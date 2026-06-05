import {useTelegramLogin, TelegramAuthData} from "@vervstack/chures";

import telegramIcon from "@/assets/icons/telegram.svg";
import AuthButton from "@/shared/ui/AuthButton.tsx";
import cls from "@/components/auth/TelegramAuth.module.css";
import useUser from "@/hooks/user/User.ts";
import {AuthViaTelegram} from "@/shared/api/Auth.ts";

export default function TelegramAuth() {
    const botId = import.meta.env.VITE_TELEGRAM_CLIENT_ID ?? "";
    const authenticate = useUser(state => state.authenticate);

    function handleSuccess(data: TelegramAuthData) {
        console.log('handleSuccess is called')
        AuthViaTelegram(data.id_token)
            .then(function (authData) {
                console.log('AuthViaTelegram done - calling authenticate with data')
                authenticate(authData);
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

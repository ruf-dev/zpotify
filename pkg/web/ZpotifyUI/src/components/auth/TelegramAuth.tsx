import {TelegramAuth as TgAuth, TelegramAuthData} from "@vervstack/chures";

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

    return <TgAuth title="Sign in with Telegram" botId={botId} onSuccess={handleSuccess}/>;
}

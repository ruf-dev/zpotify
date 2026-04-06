import cn from 'classnames';
import {useState} from "react";

import cls from "@/components/auth/TelegramAuth.module.css"

import {User} from "@/hooks/user/User.ts";
import {AuthenticateViaTelegram, AuthResults} from "@/processes/AuthTelegram.ts";
import {TgDeeplink} from "@/common/Link.ts";

import TelegramLogo from "@/assets/TelegramLogo.tsx";

interface TelegramAuthProps {
    userState: User
}

export default function TelegramAuth({userState}: TelegramAuthProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function doAuth() {
        const authProcess = AuthenticateViaTelegram();
        setIsLoading(true)

        authProcess
            .subscribe((res: AuthResults) => {
                    if (res.AuthUUID) {
                        window.open(
                            TgDeeplink(`resolve?domain=${import.meta.env.VITE_TG_BOT_NAME}&start=auth_${res.AuthUUID}`),
                            "_blank")
                    }

                    if (res.AuthData) {
                        userState.Authenticate(res.AuthData);
                    }

                    setIsLoading(false)
                }
            )
    }

    return (
        <div className={cn(cls.TelegramAuth, {
            [cls.IsLoading]: isLoading
        })}>
            <div className={cls.TgLogo}>
                <TelegramLogo/>
            </div>

            <div
                onClick={doAuth}
                className={cls.AuthButton}
            >
                Login
            </div>
        </div>
    );
}

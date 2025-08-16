import cn from 'classnames';

import cls from "@/components/auth/TelegramAuth.module.css"

import {User} from "@/hooks/user/user.ts";
import {AuthenticateViaTelegram, AuthResults} from "@/processes/auth.ts";

import TelegramLogo from "@/assets/TelegramLogo.tsx";
import {useState} from "react";

interface TelegramAuthProps {
    UserState: User
}

export default function TelegramAuth({UserState}: TelegramAuthProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function doAuth() {
        const authProcess = AuthenticateViaTelegram();
        setIsLoading(true)

        authProcess
            .subscribe((res: AuthResults) => {
                    if (res.AuthUUID) {
                        window.open(
                            `tg://resolve?domain=${import.meta.env.VITE_TG_BOT_NAME}&start=auth_${res.AuthUUID}`,
                            "_blank")
                    }

                    if (res.AuthData) {
                        UserState.authenticate({
                            token: res.AuthData.accessToken || "",
                            refreshToken: res.AuthData.refreshToken || "",
                            accessExpirationDate: res.AuthData.accessExpiresAt,
                            refreshExpirationDate: res.AuthData.refreshExpiresAt,
                        });
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

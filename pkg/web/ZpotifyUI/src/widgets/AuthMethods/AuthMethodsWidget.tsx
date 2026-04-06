import cls from "@/widgets/AuthMethods/AuthMethods.module.css";

import {User} from "@/hooks/user/User.ts";

import TelegramAuth from "@/components/auth/TelegramAuth.tsx";
import LogPassAuth from "@/components/auth/LogPassAuth.tsx";

interface AuthMethodsWidgetProps {
    userState: User
}

export default function AuthMethodsWidget({userState}: AuthMethodsWidgetProps) {

    return (
        <div className={cls.AuthMethods}>
            <div className={cls.AuthMethod}>
                <TelegramAuth
                    userState={userState}
                />
            </div>
            <div className={cls.AuthMethod}>
                <LogPassAuth
                    userState={userState}
                />
            </div>
        </div>

    )
}

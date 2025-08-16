import cls from "@/widgets/AuthMethods/AuthMethods.module.css";

import {User} from "@/hooks/user/user.ts";

import TelegramAuth from "@/components/auth/TelegramAuth.tsx";

interface AuthMethodsWidgetProps {
    UserState: User
}

export default function AuthMethodsWidget({UserState}: AuthMethodsWidgetProps) {
    return (
        <div className={cls.AuthMethods}>
            <div className={cls.AuthMethod}>
                <TelegramAuth
                    UserState={UserState}
                />
            </div>
        </div>

    )
}

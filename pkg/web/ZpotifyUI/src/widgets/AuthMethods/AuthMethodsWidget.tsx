import cls from "@/widgets/AuthMethods/AuthMethods.module.css";

import TelegramAuth from "@/components/auth/TelegramAuth.tsx";
import LogPassAuth from "@/components/auth/LogPassAuth.tsx";

export default function AuthMethodsWidget() {

    return (
        <div className={cls.AuthMethods}>
            <div className={cls.AuthMethod}>
                <TelegramAuth/>
            </div>
            <div className={cls.AuthMethod}>
                <LogPassAuth/>
            </div>
        </div>

    )
}

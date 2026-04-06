import cls from '@/components/auth/LogPassAuth.module.css'

import {User} from "@/hooks/user/User.ts";
import {useDialog} from "@/app/hooks/Dialog.tsx";
import LogPassWidget from "@/widgets/AuthWidgets/LogPassWidget.tsx";

interface LogPassAuthProps {
    userState: User
}

export default function LogPassAuth({}: LogPassAuthProps) {
    const {OpenDialog} = useDialog();

    function openLogPassAuthDialog() {
        OpenDialog(<LogPassWidget/>)
    }

    return (
        <div
            className={cls.LogPassContainer}
            onClick={openLogPassAuthDialog}
        >
            <div className={cls.ButtonText}>Password</div>
        </div>
    )
}

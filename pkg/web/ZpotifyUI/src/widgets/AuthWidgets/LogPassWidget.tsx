import {useState} from "react";

import cls from "@/widgets/AuthWidgets/LogPassWidget.module.css";

import Input from "@/components/shared/Input.tsx";
import Button from "@/components/shared/Button.tsx";
import {User} from "@/hooks/user/User.ts";
import {useDialog} from "@/app/hooks/Dialog.tsx";

interface LogPassWidgetProps {
    userState: User
}

export default function LogPassWidget({userState}: LogPassWidgetProps) {
    const [username, setUsername] = useState("");
    const [pwd, setPwd] = useState("");

    const {CloseDialog} = useDialog()

    function onEnterPressed() {
        userState.Services()
            .Auth()
            .AuthViaPass(username, pwd)
            .then(userState.Authenticate)
            .then(CloseDialog)
    }

    return (
        <div className={cls.LogPassWidgetContainer}>
            <Input
                inputValue={username}
                onChange={setUsername}
                label={'Login'}
            />
            <Input
                inputValue={pwd}
                onChange={setPwd}
                label={'Password'}
            />

            <Button
                title={"Enter"}
                onClick={onEnterPressed}
            />
        </div>
    )
}

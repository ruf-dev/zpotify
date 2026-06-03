import {useState} from "react";
import React from "react";

import cls from "@/widgets/AuthWidgets/LogPassWidget.module.css";

import Input from "@/components/shared/Input.tsx";
import Button from "@/components/shared/Button.tsx";
import Chip from "@/components/shared/Chip.tsx";
import useUser from "@/hooks/user/User.ts";
import {useDialog} from "@/app/hooks/Dialog.tsx";

interface LogPassWidgetProps {
    previousScreen?: React.JSX.Element;
}

export default function LogPassWidget({previousScreen}: LogPassWidgetProps) {
    const [username, setUsername] = useState("");
    const [pwd, setPwd] = useState("");

    const {OpenDialog, CloseDialog} = useDialog()
    const Services = useUser(state => state.Services);
    const authenticate = useUser(state => state.authenticate);

    function onEnterPressed() {
        Services()
            .Auth()
            .AuthViaPass(username, pwd)
            .then(authenticate)
            .then(CloseDialog)
    }

    return (
        <div className={cls.LogPassWidgetContainer}>
            <div className={cls.CloseButton}>
                <Chip value="×" onClick={CloseDialog}/>
            </div>
            {previousScreen && (
                <div className={cls.Header}>
                    <Button
                        title="<"
                        onClick={() => OpenDialog(previousScreen)}
                    />
                </div>
            )}
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

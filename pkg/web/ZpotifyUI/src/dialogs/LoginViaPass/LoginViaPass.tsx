import {KeyboardEvent, useState} from "react";

import cls from "@/dialogs/LoginViaPass/LoginViaPass.module.css";

import FloatInput from "@/components/shared/FloatInput.tsx";

import {User} from "@/hooks/user/User.ts";
import {useNavigate} from "react-router-dom";
import {Path} from "@/app/routing/Router.tsx";
import {useDialog} from "@/app/hooks/Dialog.tsx";

interface LoginViaPassProps {
    userState: User;
}

export default function LoginViaPass({userState}: LoginViaPassProps) {
    const navigate = useNavigate();
    const {CloseDialog} = useDialog();


    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [validationErr, setValidationErr] = useState('');

    function handleSubmit() {
        if (!username.trim() || !password.trim()) {
            setValidationErr('Please fill in both fields.');
            return;
        }
        setValidationErr('');
        userState.Services()
            .Auth()
            .AuthViaPass(username.trim(), password)
            .then(userState.Authenticate)
            .then(() => navigate(Path.HomePage))
            .then(CloseDialog)
    }

    function handleCardKey(e: KeyboardEvent) {
        if (e.key === 'Enter') handleSubmit();
    }

    return (
        <div className={cls.Overlay}>
            <div className={cls.Card} onKeyDown={handleCardKey}>
                <div className={cls.Title}>Sign in</div>

                <FloatInput value={username} onChange={setUsername} label="Username" autoFocus/>
                <FloatInput value={password} onChange={setPassword} type="password" label="Password"/>

                {validationErr && <div className={cls.Error}>{validationErr}</div>}

                <button className={cls.SubmitButton} onClick={handleSubmit}>
                    Sign in
                </button>
            </div>
        </div>
    );
}

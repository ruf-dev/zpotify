import {KeyboardEvent, useEffect, useState} from "react";
import cls from "@/pages/init/PasswordModal.module.css";
import FloatInput from "@/components/shared/FloatInput.tsx";
import {User} from "@/hooks/user/User.ts";

interface PasswordModalProps {
    userState: User;
    onClose: () => void;
}

export default function PasswordModal({userState, onClose}: PasswordModalProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        function onKeyDown(e: globalThis.KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    function handleSubmit() {
        if (!username.trim() || !password.trim()) {
            setError('Please fill in both fields.');
            return;
        }
        setError('');
        userState.Services()
            .Auth()
            .AuthViaPass(username.trim(), password)
            .then(userState.Authenticate)
            .then(onClose);
    }

    function handleCardKey(e: KeyboardEvent) {
        if (e.key === 'Enter') handleSubmit();
    }

    return (
        <div
            className={cls.Overlay}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className={cls.Card} onKeyDown={handleCardKey}>
                <div className={cls.Title}>Sign in</div>

                <FloatInput value={username} onChange={setUsername} label="Username" autoFocus />
                <FloatInput value={password} onChange={setPassword} type="password" label="Password" />

                {error && <div className={cls.Error}>{error}</div>}

                <button className={cls.SubmitButton} onClick={handleSubmit}>
                    Sign in
                </button>

                <button className={cls.CancelButton} onClick={onClose}>
                    cancel
                </button>
            </div>
        </div>
    );
}

import { KeyboardEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import cls from '@/dialogs/LoginViaPass/LoginViaPass.module.css';
import FloatInput from '@/shared/ui/FloatInput.tsx';
import useUser from '@/entities/user/useUser.ts';
import { Path } from '@/app/routing/paths';
import { useDialog } from '@/app/hooks/Dialog.tsx';

export default function LoginViaPass() {
    const navigate = useNavigate();
    const { CloseDialog } = useDialog();
    const Services = useUser((state) => state.Services);
    const authenticate = useUser((state) => state.authenticate);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [validationErr, setValidationErr] = useState('');

    function handleSubmit() {
        if (!username.trim() || !password.trim()) {
            setValidationErr('Please fill in both fields.');
            return;
        }
        setValidationErr('');
        Services()
            .Auth()
            .AuthViaPass(username.trim(), password)
            .then(authenticate)
            .then(() => navigate(Path.HomePage))
            .then(CloseDialog);
    }

    function handleCardKey(e: KeyboardEvent) {
        if (e.key === 'Enter') handleSubmit();
    }

    return (
        <div className={cls.Overlay}>
            <div className={cls.Card} onKeyDown={handleCardKey}>
                <div className={cls.Title}>Sign in</div>

                <FloatInput value={username} onChange={setUsername} label="Username" autoFocus />
                <FloatInput value={password} onChange={setPassword} type="password" label="Password" />

                {validationErr && <div className={cls.Error}>{validationErr}</div>}

                <button className={cls.SubmitButton} onClick={handleSubmit}>
                    Sign in
                </button>
            </div>
        </div>
    );
}

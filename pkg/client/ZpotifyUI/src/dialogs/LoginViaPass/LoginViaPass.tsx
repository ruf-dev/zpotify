import { KeyboardEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, ModalActions, ModalClose } from '@vervstack/chures';

import useUser from '@/entities/user/useUser.ts';
import { authService } from '@/shared/api/Auth.ts';
import { Path } from '@/app/routing/paths';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import modalCloseCls from '@/shared/ui/ModalCloseButton.module.css';
import cls from '@/dialogs/LoginViaPass/LoginViaPass.module.css';

export default function LoginViaPass() {
    const navigate = useNavigate();
    const { CloseDialog } = useDialog();
    const toaster = useToaster();
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
        authService
            .AuthViaPass(username.trim(), password)
            .then(authenticate)
            .then(() => navigate(Path.HomePage))
            .then(CloseDialog)
            .catch(toaster.catch);
    }

    function handleCardKey(e: KeyboardEvent) {
        if (e.key === 'Enter') handleSubmit();
    }

    return (
        <div className={cls.LoginViaPassContainer} onKeyDown={handleCardKey}>
            <ModalClose className={modalCloseCls.ModalCloseButton} onClick={CloseDialog} />

            <div className={cls.Title}>Sign in</div>

            <Input value={username} setValue={setUsername} label="Username" autoFocus />
            <Input value={password} setValue={setPassword} type="password" label="Password" />

            {validationErr && <div className={cls.Error}>{validationErr}</div>}

            <ModalActions buttons={[{ label: 'Sign in', onClick: handleSubmit, className: cls.SubmitButton }]} />
        </div>
    );
}

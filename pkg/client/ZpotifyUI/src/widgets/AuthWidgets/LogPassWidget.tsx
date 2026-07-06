import React, { useState } from 'react';
import { ModalClose } from '@vervstack/chures';

import cls from '@/widgets/AuthWidgets/LogPassWidget.module.css';
import modalCloseCls from '@/shared/ui/ModalCloseButton.module.css';
import Input from '@/shared/ui/Input.tsx';
import Button from '@/shared/ui/Button.tsx';
import useUser from '@/entities/user/useUser.ts';
import { authService } from '@/shared/api/Auth.ts';
import { useDialog } from '@/app/hooks/Dialog.tsx';

interface LogPassWidgetProps {
    previousScreen?: React.JSX.Element;
}

export default function LogPassWidget({ previousScreen }: LogPassWidgetProps) {
    const [username, setUsername] = useState('');
    const [pwd, setPwd] = useState('');

    const { OpenDialog, CloseDialog } = useDialog();
    const authenticate = useUser((state) => state.authenticate);

    function onEnterPressed() {
        authService.AuthViaPass(username, pwd).then(authenticate).then(CloseDialog);
    }

    return (
        <div className={cls.LogPassWidgetContainer}>
            <div className={cls.CloseButton}>
                <ModalClose className={modalCloseCls.ModalCloseButton} onClick={CloseDialog} />
            </div>
            {previousScreen && (
                <div className={cls.Header}>
                    <Button title="<" onClick={() => OpenDialog(previousScreen)} />
                </div>
            )}
            <Input inputValue={username} onChange={setUsername} label={'Login'} />
            <Input inputValue={pwd} onChange={setPwd} label={'Password'} />

            <Button title={'Enter'} onClick={onEnterPressed} />
        </div>
    );
}

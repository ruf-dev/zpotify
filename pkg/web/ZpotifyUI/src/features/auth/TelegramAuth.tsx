import { useState, useEffect } from 'react';
import { useTelegramLogin, TelegramAuthData } from '@vervstack/chures';

import telegramIcon from '@/assets/icons/telegram.svg';
import AuthButton from '@/shared/ui/AuthButton.tsx';
import cls from '@/features/auth/TelegramAuth.module.css';
import useUser from '@/entities/user/useUser.ts';
import { AuthViaTelegram, GetTelegramBotId } from '@/shared/api/Auth.ts';

export default function TelegramAuth() {
    const [botId, setBotId] = useState('');
    const authenticate = useUser((state) => state.authenticate);

    useEffect(function fetchBotId() {
        GetTelegramBotId().then(setBotId);
    }, []);

    function handleSuccess(data: TelegramAuthData) {
        AuthViaTelegram(data.id_token)
            .then(function (authData) {
                authenticate(authData);
            })
            .catch(function (err: unknown) {
                alert(err instanceof Error ? err.message : 'Telegram login failed');
            });
    }

    const { login, isReady, isLoading } = useTelegramLogin({ botId, onSuccess: handleSuccess });

    return (
        <AuthButton
            icon={<img src={telegramIcon} className={cls.TelegramIcon} alt="" />}
            label="Use Telegram"
            onClick={login}
            disabled={!isReady || isLoading}
            className={cls.TelegramButton}
        />
    );
}

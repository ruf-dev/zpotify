import { useState, useEffect } from 'react';
import { useTelegramLogin, TelegramAuthData } from '@vervstack/chures';

import telegramIcon from '@/assets/icons/telegram.svg';
import AuthButton from '@/shared/ui/AuthButton.tsx';
import cls from '@/features/auth/TelegramAuth.module.css';
import useUser from '@/entities/user/useUser.ts';
import { AuthViaTelegram } from '@/shared/api/Auth.ts';
import { AuthAPI } from '@/app/api/zpotify/zpotify_service_auth.pb';

export default function TelegramAuth() {
    const [botId, setBotId] = useState('');
    const authenticate = useUser((state) => state.authenticate);

    useEffect(function fetchBotId() {
        AuthAPI.GetAuthMethods({}).then(function (resp) {
            if (resp.telegramBotId) {
                setBotId(resp.telegramBotId);
            }
        });
    }, []);

    function handleSuccess(data: TelegramAuthData) {
        console.log('handleSuccess is called');
        AuthViaTelegram(data.id_token)
            .then(function (authData) {
                console.log('AuthViaTelegram done - calling authenticate with data');
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

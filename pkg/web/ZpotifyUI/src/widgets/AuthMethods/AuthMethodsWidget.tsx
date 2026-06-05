import cls from '@/widgets/AuthMethods/AuthMethods.module.css';
import TelegramAuth from '@/features/auth/TelegramAuth.tsx';
import LogPassAuth from '@/features/auth/LogPassAuth.tsx';

export default function AuthMethodsWidget() {
    return (
        <div className={cls.AuthMethods}>
            <div className={cls.AuthMethod}>
                <TelegramAuth />
            </div>
            <div className={cls.AuthMethod}>
                <LogPassAuth />
            </div>
        </div>
    );
}

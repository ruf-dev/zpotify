import cls from '@/features/auth/LogPassAuth.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import LogPassWidget from '@/widgets/AuthWidgets/LogPassWidget.tsx';

export default function LogPassAuth() {
    const { OpenDialog } = useDialog();

    function openLogPassAuthDialog() {
        OpenDialog(<LogPassWidget />);
    }

    return (
        <div className={cls.LogPassContainer} onClick={openLogPassAuthDialog}>
            <div className={cls.ButtonText}>Password</div>
        </div>
    );
}

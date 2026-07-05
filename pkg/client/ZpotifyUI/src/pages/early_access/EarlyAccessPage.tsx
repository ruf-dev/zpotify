import { useNavigate } from 'react-router-dom';

import cls from '@/pages/early_access/EarlyAccessPage.module.css';
import useUser from '@/entities/user/useUser.ts';
import { Path } from '@/app/routing/paths.ts';
import Button from '@/shared/ui/Button';

export default function EarlyAccessPage() {
    const navigate = useNavigate();
    const { earlyAccessDenied, logout } = useUser();
    if (!earlyAccessDenied) navigate(Path.HomePage);

    return (
        <div className={cls.EarlyAccessPageContainer}>
            <div className={cls.InfoBoxWrapper}>
                <div className={cls.InfoBox}>
                    Service is in early access. Administrator already sees your request and will be in touch soon.
                </div>
                <Button className={cls.LogoutButton} title="Logout" onClick={logout} />
            </div>
        </div>
    );
}

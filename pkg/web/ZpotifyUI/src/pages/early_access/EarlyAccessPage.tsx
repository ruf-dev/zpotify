import cls from "@/pages/early_access/EarlyAccessPage.module.css";
import {User} from "@/hooks/user/User.ts";
import {useNavigate} from "react-router-dom";
import {Path} from "@/app/routing/Router.tsx";

interface EarlyAccessPageProps {
    user: User
}

export default function EarlyAccessPage({user}: EarlyAccessPageProps) {
    const navigate = useNavigate()
    if (!user.earlyAccessDenied) navigate(Path.HomePage)

    return (
        <div className={cls.EarlyAccessPageContainer}>
            <div className={cls.InfoBoxWrapper}>
                <div className={cls.InfoBox}>
                    Service is in early access. Administrator already sees your request and will be in touch soon.
                </div>
            </div>
        </div>
    );
}

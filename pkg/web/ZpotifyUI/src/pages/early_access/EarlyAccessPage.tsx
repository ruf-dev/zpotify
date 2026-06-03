import cls from "@/pages/early_access/EarlyAccessPage.module.css";
import useUser from "@/hooks/user/User.ts";
import {useNavigate} from "react-router-dom";
import {Path} from "@/app/routing/Router.tsx";

export default function EarlyAccessPage() {
    const navigate = useNavigate();
    const {earlyAccessDenied} = useUser();
    if (!earlyAccessDenied) navigate(Path.HomePage);

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

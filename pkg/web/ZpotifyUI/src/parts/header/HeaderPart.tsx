import cls from "@/parts/header/HeaderPart.module.css";

import {User} from "@/hooks/user/User.ts";
import AnimatedZ from "@/assets/AnimatedZ.tsx";
import {useNavigate} from "react-router-dom";
import {Path} from "@/app/routing/Router.tsx";
import UserWidget from "@/widgets/User/UserWidget.tsx";

interface HeaderPartProps {
    user: User
}

export default function HeaderPart({user}: HeaderPartProps) {
    const navigate = useNavigate();

    return (
        <div className={cls.Header}>
            <div className={cls.LogoContainer} onClick={() => navigate(Path.HomePage)}>
                <div className={cls.Logo}>
                    <AnimatedZ/>
                </div>
                <span className={cls.Wordmark}>zpotify</span>
            </div>

            <div className={cls.SearchContainer}/>
            <div className={cls.UserContainer}>
                <UserWidget user={user}/>
            </div>

        </div>
    )
}

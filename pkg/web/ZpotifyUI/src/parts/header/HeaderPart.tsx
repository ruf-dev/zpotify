import cls from "@/parts/header/HeaderPart.module.css";

import {User} from "@/hooks/user/user.ts";
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
            <div className={cls.LogoContainer}>
                <div
                    className={cls.Logo}
                    onClick={()=>navigate(Path.HomePage)}>
                    <AnimatedZ/>
                </div>
            </div>

            <div className={cls.SearchContainer}></div>
            <div className={cls.UserContainer}>
                <UserWidget user={user}/>
            </div>

        </div>
    )
}

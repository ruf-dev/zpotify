import cls from "@/widgets/User/UserWidget.module.css";

import {User} from "@/hooks/user/user.ts";
import {useEffect} from "react";

interface UserWidgetProps {
    user: User;
}

export default function UserWidget({user}: UserWidgetProps) {
    useEffect(() => {
        console.log(user)
    }, []);
    return (
        <div className={cls.UserWidget}>
            {user.userData?.username}
        </div>
    )
}

import cls from "@/widgets/User/UserWidget.module.css";

import {User} from "@/hooks/user/user.ts";

interface UserWidgetProps {
    user: User;
}

export default function UserWidget({user}: UserWidgetProps) {
    return (
        <div className={cls.UserWidget}>
            {user.userData?.username}
        </div>
    )
}

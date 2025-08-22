import cn from 'classnames';
import {useState} from "react";

import cls from "@/widgets/User/UserWidget.module.css";

import {User} from "@/hooks/user/user.ts";

import GeneratedAvatar from "@/components/user/GeneratedAvatar.tsx";
import Menu from "@/components/menu/Menu.tsx";

interface UserWidgetProps {
    user: User;
}

export default function UserWidget({user}: UserWidgetProps) {
    if (!user.userData) {
        return null
    }

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuOptions = [
        {label: 'Profile', disabled: true},
        {label: 'Settings', disabled: true},
        {},
        {
            label: 'Logout', onClick: () => {
                user.logout()
            }
        }
    ]

    return (
        <div className={cls.UserWidget}>
            <div className={cls.SubMenuContainer}>
                <div className={cn(cls.SubMenu,
                    {[cls.open]: isMenuOpen})}>
                    <Menu options={menuOptions}/>
                </div>
            </div>

            <div className={cls.MainContent}>
                <div className={cls.Username}>
                    {user.userData.username}
                </div>


                <div className={cls.AvatarContainer}>
                    <div className={cls.Avatar}
                         onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <GeneratedAvatar username={user.userData.username}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

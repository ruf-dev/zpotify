import {useEffect, useRef, useState} from "react";

import cls from "@/widgets/User/UserWidget.module.css";

import {User} from "@/hooks/user/User.ts";

import GeneratedAvatar from "@/components/user/GeneratedAvatar.tsx";
import Menu from "@/components/menu/Menu.tsx";

interface UserWidgetProps {
    user: User;
}

export default function UserWidget({user}: UserWidgetProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const widgetRef = useRef<HTMLDivElement>(null);

    const menuOptions = [
        {label: 'Profile', disabled: true},
        {label: 'Settings', disabled: true},
        {},
        {
            label: 'Logout', onClick: () => {
                user.Logout()
            }
        }
    ]

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user.userData) {
        return (<></>)
    }

    return (
        <div className={cls.UserWidget} ref={widgetRef}>
            <div
                className={cls.Pill}
                onClick={() => setIsMenuOpen(o => !o)}
            >
                <div className={cls.AvatarContainer}>
                    <GeneratedAvatar username={user.userData.username} pictureUrl={user.userData.pictureUrl}/>
                </div>
                <span className={cls.Username}>{user.userData.username}</span>
            </div>

            {isMenuOpen && (
                <div className={cls.Dropdown}>
                    <Menu options={menuOptions}/>
                </div>
            )}
        </div>
    )
}

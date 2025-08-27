import cn from 'classnames';
import {useEffect, useRef, useState} from "react";

import cls from "@/widgets/User/UserWidget.module.css";

import {User} from "@/hooks/user/user.ts";

import GeneratedAvatar from "@/components/user/GeneratedAvatar.tsx";
import Menu from "@/components/menu/Menu.tsx";

interface UserWidgetProps {
    user: User;
}

export default function UserWidget({user}: UserWidgetProps) {
    if (!user.userData) {
        return (<></>)
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

    const dropdownRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // @ts-ignore
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }

        // Bind the listener
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            // Clean up the listener on unmount
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className={cls.UserWidget}>
            <div
                ref={dropdownRef}
                className={cls.SubMenuContainer}>
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

import { useEffect, useRef, useState } from 'react';

import cls from '@/widgets/User/UserWidget.module.css';
import useUser from '@/entities/user/useUser.ts';
import GeneratedAvatar from '@/entities/user/GeneratedAvatar.tsx';
import Menu from '@/components/menu/Menu.tsx';

export default function UserWidget() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const widgetRef = useRef<HTMLDivElement>(null);

    const userData = useUser((state) => state.userData);
    const logout = useUser((state) => state.logout);

    const menuOptions = [
        { label: 'Profile', disabled: true },
        { label: 'Settings', disabled: true },
        {},
        { label: 'Logout', onClick: logout },
    ];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!userData) {
        return <></>;
    }

    return (
        <div className={cls.UserWidget} ref={widgetRef}>
            <div className={cls.Pill} onClick={() => setIsMenuOpen((o) => !o)}>
                <div className={cls.AvatarContainer}>
                    <GeneratedAvatar username={userData.username} pictureUrl={userData.pictureUrl} />
                </div>
                <span className={cls.Username}>{userData.username}</span>
            </div>

            {isMenuOpen && (
                <div className={cls.Dropdown}>
                    <Menu options={menuOptions} />
                </div>
            )}
        </div>
    );
}

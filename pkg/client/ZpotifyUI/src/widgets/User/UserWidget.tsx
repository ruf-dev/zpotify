import { useEffect, useRef, useState } from 'react';
import cn from 'classnames';

import cls from '@/widgets/User/UserWidget.module.css';
import useUser from '@/entities/user/useUser.ts';
import GeneratedAvatar from '@/entities/user/GeneratedAvatar.tsx';
import Menu from '@/components/menu/Menu.tsx';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import SettingsDialog from '@/dialogs/Settings/SettingsDialog.tsx';

interface UserWidgetProps {
    dropdownDirection?: 'down' | 'up';
    showUsername?: boolean;
}

export default function UserWidget({ dropdownDirection = 'down', showUsername = true }: UserWidgetProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const widgetRef = useRef<HTMLDivElement>(null);

    const userData = useUser((state) => state.userData);
    const logout = useUser((state) => state.logout);
    const { OpenDialog } = useDialog();

    function openSettings() {
        setIsMenuOpen(false);
        OpenDialog(<SettingsDialog />);
    }

    const menuOptions = [
        { label: 'Profile', disabled: true },
        { label: 'Settings', onClick: openSettings },
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
            <div className={cn(cls.Pill, !showUsername && cls.PillCompact)} onClick={() => setIsMenuOpen((o) => !o)}>
                <div className={cls.AvatarContainer}>
                    <GeneratedAvatar username={userData.username} pictureUrl={userData.pictureUrl} />
                </div>
                {showUsername && <span className={cls.Username}>{userData.username}</span>}
            </div>

            {isMenuOpen && (
                <div className={cn(cls.Dropdown, dropdownDirection === 'up' ? cls.DropdownUp : cls.DropdownDown)}>
                    <Menu options={menuOptions} />
                </div>
            )}
        </div>
    );
}

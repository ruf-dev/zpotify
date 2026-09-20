import { useEffect, useRef, useState } from 'react';
import cn from 'classnames';

import cls from '@/widgets/User/UserWidget.module.css';
import UserWidgetSkeleton from '@/widgets/User/UserWidgetSkeleton.tsx';
import useUser from '@/entities/user/useUser.ts';
import GeneratedAvatar from '@/entities/user/GeneratedAvatar.tsx';
import Menu from '@/components/menu/Menu.tsx';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import SettingsDialog from '@/dialogs/Settings/SettingsDialog.tsx';
import useNotifications from '@/entities/notification/useNotifications.ts';
import { BellIcon } from '@/assets/icons/BellIcon.tsx';

interface UserWidgetProps {
    dropdownDirection?: 'down' | 'up';
    showUsername?: boolean;
}

export default function UserWidget({ dropdownDirection = 'down', showUsername = true }: UserWidgetProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuClosing, setIsMenuClosing] = useState(false);
    const widgetRef = useRef<HTMLDivElement>(null);

    function closeMenu() {
        setIsMenuClosing(true);
    }

    function handleDropdownAnimationEnd() {
        if (isMenuClosing) {
            setIsMenuOpen(false);
            setIsMenuClosing(false);
        }
    }

    const userData = useUser((state) => state.userData);
    const authStatus = useUser((state) => state.authStatus);
    const logout = useUser((state) => state.logout);
    const openNotificationsPanel = useNotifications((state) => state.openPanel);
    const { OpenDialog } = useDialog();

    function openSettings() {
        closeMenu();
        OpenDialog(<SettingsDialog />);
    }

    function openNotifications() {
        closeMenu();
        openNotificationsPanel();
    }

    function toggleMenu() {
        if (isMenuOpen) {
            closeMenu();
        } else {
            setIsMenuClosing(false);
            setIsMenuOpen(true);
        }
    }

    const menuOptions = [
        { label: 'Profile', disabled: true },
        { label: 'Settings', onClick: openSettings },
        { label: 'Notifications', icon: <BellIcon />, onClick: openNotifications },
        {},
        { label: 'Logout', onClick: logout },
    ];

    useEffect(() => {
        if (!isMenuOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
                setIsMenuClosing(true);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    if (authStatus === 'checking') {
        return <UserWidgetSkeleton showUsername={showUsername} />;
    }

    if (!userData) {
        return <></>;
    }

    return (
        <div className={cls.UserWidget} ref={widgetRef}>
            <div className={cn(cls.Pill, !showUsername && cls.PillCompact)} onClick={toggleMenu}>
                <div className={cls.AvatarContainer}>
                    <GeneratedAvatar username={userData.username} pictureUrl={userData.pictureUrl} />
                </div>
                {showUsername && <span className={cls.Username}>{userData.username}</span>}
            </div>

            {isMenuOpen && (
                <div
                    className={cn(
                        cls.Dropdown,
                        dropdownDirection === 'up' ? cls.DropdownUp : cls.DropdownDown,
                        isMenuClosing && cls.DropdownClosing,
                    )}
                    onAnimationEnd={handleDropdownAnimationEnd}
                >
                    <Menu options={menuOptions} />
                </div>
            )}
        </div>
    );
}

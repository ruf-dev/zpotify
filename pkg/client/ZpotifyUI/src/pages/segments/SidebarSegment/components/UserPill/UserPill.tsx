import cn from 'classnames';
import cls from '@/pages/segments/SidebarSegment/components/UserPill/UserPill.module.css';

interface UserPillProps {
    username: string;
    isCollapsed: boolean;
}

export default function UserPill({ username, isCollapsed }: UserPillProps) {
    return (
        <div className={cls.UserPill}>
            <div className={cls.UserAvatar}>
                {username[0].toUpperCase()}
            </div>
            <span className={cn(cls.UserName, isCollapsed && cls.UserNameHidden)}>
                {username}
            </span>
        </div>
    );
}

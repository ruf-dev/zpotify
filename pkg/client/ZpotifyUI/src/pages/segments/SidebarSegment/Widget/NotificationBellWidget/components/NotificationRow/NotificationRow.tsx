import cn from 'classnames';

import cls from '@/pages/segments/SidebarSegment/Widget/NotificationBellWidget/components/NotificationRow/NotificationRow.module.css';
import type { Notification } from '@/app/api/zpotify';

function formatNotificationDate(createdAt: unknown): string {
    if (!createdAt) return '';
    const date = new Date(createdAt as string);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface NotificationRowProps {
    notification: Notification;
    onClick: () => void;
}

export default function NotificationRow({ notification, onClick }: NotificationRowProps) {
    const isUnread = !notification.isRead;

    return (
        <div className={cls.NotificationRowContainer} onClick={onClick}>
            {isUnread && <span className={cls.UnreadDot} />}
            <div className={cls.NotificationRowBody}>
                <span className={cn(cls.NotificationRowTitle, isUnread ? cls.TitleUnread : cls.TitleRead)}>
                    {notification.title}
                </span>
                <span className={cls.NotificationRowDate}>{formatNotificationDate(notification.createdAt)}</span>
            </div>
        </div>
    );
}

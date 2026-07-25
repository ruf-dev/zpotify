import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { BellIcon } from '@/assets/icons/BellIcon.tsx';
import NotificationRow from '@/widgets/NotificationBell/components/NotificationRow/NotificationRow';
import cls from '@/widgets/NotificationBell/NotificationBellWidget.module.css';
import useNotifications from '@/entities/notification/useNotifications.ts';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import NotificationDialog from '@/dialogs/Notification/NotificationDialog';
import type { Notification } from '@/app/api/zpotify';

const LIST_LIMIT = 20;

export default function NotificationBellWidget() {
    const [hasLoadedList, setHasLoadedList] = useState(false);
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

    const bellRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const isPanelOpen = useNotifications((s) => s.isPanelOpen);
    const unreadCount = useNotifications((s) => s.unreadCount);
    const notifications = useNotifications((s) => s.notifications);
    const isLoading = useNotifications((s) => s.isLoading);
    const fetchSummary = useNotifications((s) => s.fetchSummary);
    const fetchList = useNotifications((s) => s.fetchList);
    const markRead = useNotifications((s) => s.markRead);
    const togglePanel = useNotifications((s) => s.togglePanel);
    const closePanel = useNotifications((s) => s.closePanel);

    const { OpenDialog } = useDialog();

    useEffect(() => {
        fetchSummary().catch(() => {});
    }, [fetchSummary]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (bellRef.current?.contains(target)) return;
            if (!panelRef.current?.contains(target)) closePanel();
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [closePanel]);

    useEffect(() => {
        if (!isPanelOpen) return;

        setAnchorRect(bellRef.current?.getBoundingClientRect() ?? null);

        if (!hasLoadedList) {
            setHasLoadedList(true);
            fetchList({ limit: String(LIST_LIMIT), offset: '0' }).catch(() => {});
        }
    }, [isPanelOpen, hasLoadedList, fetchList]);

    function handleRowClick(notification: Notification) {
        closePanel();
        if (notification.id && !notification.isRead) {
            markRead(notification.id).catch(() => {});
        }
        OpenDialog(<NotificationDialog key={notification.id} notification={notification} />);
    }

    return (
        <div ref={bellRef} className={cls.BellButtonContainer} onClick={togglePanel}>
            <BellIcon />
            {unreadCount > 0 && <span className={cls.UnreadBadge} />}

            {isPanelOpen &&
                anchorRect &&
                createPortal(
                    <div
                        ref={panelRef}
                        className={cls.DropdownPanel}
                        style={{
                            position: 'fixed',
                            top: anchorRect.bottom + 8,
                            right: window.innerWidth - anchorRect.right,
                        }}
                    >
                        <div className={cls.PanelHeader}>
                            <span className={cls.PanelTitle}>Notifications</span>
                        </div>
                        <div className={cls.RowsList}>
                            {isLoading && notifications.length === 0 && <span className={cls.EmptyHint}>Loading…</span>}
                            {!isLoading && notifications.length === 0 && (
                                <span className={cls.EmptyHint}>No notifications yet</span>
                            )}
                            {notifications.map((notification) => (
                                <NotificationRow
                                    key={notification.id}
                                    notification={notification}
                                    onClick={() => handleRowClick(notification)}
                                />
                            ))}
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}

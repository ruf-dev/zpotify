import { create } from 'zustand';

import type { Notification, Paging } from '@/app/api/zpotify';
import { notificationsService } from '@/shared/api/Notifications.ts';
import { ServiceError } from '@/shared/api/Errors.ts';
import { catchServiceError } from '@/shared/lib/toaster/ToasterZ.ts';

export interface NotificationsState {
    notifications: Notification[];
    unreadCount: number;
    total: number;
    isLoading: boolean;

    fetchSummary: () => Promise<void>;
    fetchList: (paging: Paging) => Promise<void>;
    markRead: (id: string) => Promise<void>;
    consent: (id: string) => Promise<void>;
}

const useNotifications = create<NotificationsState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    total: 0,
    isLoading: false,

    fetchSummary: () => {
        return notificationsService
            .GetSummary()
            .then((unreadCount) => {
                set({ unreadCount });
            })
            .catch((err: unknown) => catchServiceError(err as ServiceError));
    },

    fetchList: (paging: Paging) => {
        set({ isLoading: true });

        return notificationsService
            .ListNotifications(paging)
            .then(({ notifications, total }) => {
                set({ notifications, total });
            })
            .catch((err: unknown) => catchServiceError(err as ServiceError))
            .finally(() => set({ isLoading: false }));
    },

    markRead: (id: string) => {
        const previousNotifications = get().notifications;
        const target = previousNotifications.find((n) => n.id === id);
        if (!target || target.isRead) return Promise.resolve();

        set((s) => ({
            notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
            unreadCount: Math.max(0, s.unreadCount - 1),
        }));

        return notificationsService.MarkRead(id).catch((err: unknown) => {
            set({ notifications: previousNotifications, unreadCount: get().unreadCount + 1 });
            catchServiceError(err as ServiceError);
        });
    },

    consent: (id: string) => {
        return notificationsService
            .Consent(id)
            .then(() => {
                set((s) => ({
                    notifications: s.notifications.map((n) => (n.id === id ? { ...n, consented: true } : n)),
                }));
            })
            .catch((err: unknown) => {
                catchServiceError(err as ServiceError);
                throw err;
            });
    },
}));

export default useNotifications;

import { InitReq, Notification, NotificationAPI, Paging } from '@/app/api/zpotify';
import { BaseService } from '@/shared/api/BaseService.ts';

export interface INotificationsService {
    GetSummary: () => Promise<number>;
    ListNotifications: (paging: Paging) => Promise<{ notifications: Notification[]; total: number }>;
    MarkRead: (id: string) => Promise<void>;
    Consent: (id: string) => Promise<void>;
}

export class NotificationsService extends BaseService implements INotificationsService {
    async GetSummary(): Promise<number> {
        return this.executeAuthApiCall((initReq: InitReq) => {
            return NotificationAPI.GetNotificationSummary({}, initReq).then((resp) => resp.unreadCount ?? 0);
        });
    }

    async ListNotifications(paging: Paging): Promise<{ notifications: Notification[]; total: number }> {
        return this.executeAuthApiCall((initReq: InitReq) => {
            return NotificationAPI.ListNotifications({ paging }, initReq).then((resp) => ({
                notifications: resp.notifications ?? [],
                total: resp.total ?? 0,
            }));
        });
    }

    async MarkRead(id: string): Promise<void> {
        return this.executeAuthApiCall((initReq: InitReq) => {
            return NotificationAPI.MarkNotificationRead({ id }, initReq).then(() => undefined);
        });
    }

    async Consent(id: string): Promise<void> {
        return this.executeAuthApiCall((initReq: InitReq) => {
            return NotificationAPI.ConsentNotification({ id }, initReq).then(() => undefined);
        });
    }
}

export const notificationsService = new NotificationsService();

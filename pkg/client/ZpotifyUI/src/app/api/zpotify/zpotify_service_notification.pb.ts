/* eslint-disable */
// @ts-nocheck

/**
 * This file is a generated Typescript file for GRPC Gateway, DO NOT MODIFY
 */

import * as fm from "./fetch.pb";
import * as GoogleProtobufTimestamp from "./google/protobuf/timestamp.pb";
import * as ZpotifyApiZpotifyCommon from "./zpotify_common.pb";


export type Notification = {
  id?: string;
  title?: string;
  bodyMarkdown?: string;
  requiresConsent?: boolean;
  createdAt?: GoogleProtobufTimestamp.Timestamp;
  isRead?: boolean;
  consented?: boolean;
};

export type GetNotificationSummaryRequest = Record<string, never>;

export type GetNotificationSummaryResponse = {
  unreadCount?: number;
};

export type GetNotificationSummary = Record<string, never>;

export type ListNotificationsRequest = {
  paging?: ZpotifyApiZpotifyCommon.Paging;
};

export type ListNotificationsResponse = {
  notifications?: Notification[];
  total?: number;
};

export type ListNotifications = Record<string, never>;

export type MarkNotificationReadRequest = {
  id?: string;
};

export type MarkNotificationReadResponse = Record<string, never>;

export type MarkNotificationRead = Record<string, never>;

export type ConsentNotificationRequest = {
  id?: string;
};

export type ConsentNotificationResponse = Record<string, never>;

export type ConsentNotification = Record<string, never>;

export class NotificationAPI {
  static GetNotificationSummary(this:void, req: GetNotificationSummaryRequest, initReq?: fm.InitReq): Promise<GetNotificationSummaryResponse> {
    return fm.fetchRequest<GetNotificationSummaryResponse>(`/api/notification/summary?${fm.renderURLSearchParams(req, [])}`, {...initReq, method: "GET"});
  }
  static ListNotifications(this:void, req: ListNotificationsRequest, initReq?: fm.InitReq): Promise<ListNotificationsResponse> {
    return fm.fetchRequest<ListNotificationsResponse>(`/api/notification/list`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static MarkNotificationRead(this:void, req: MarkNotificationReadRequest, initReq?: fm.InitReq): Promise<MarkNotificationReadResponse> {
    return fm.fetchRequest<MarkNotificationReadResponse>(`/api/notification/mark_read`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
  static ConsentNotification(this:void, req: ConsentNotificationRequest, initReq?: fm.InitReq): Promise<ConsentNotificationResponse> {
    return fm.fetchRequest<ConsentNotificationResponse>(`/api/notification/consent`, {...initReq, method: "POST", body: JSON.stringify(req, fm.replacer)});
  }
}
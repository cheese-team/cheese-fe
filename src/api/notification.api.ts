import { apiClient } from '@/api/client';

import type {
  NotificationListResponse,
  NotificationSuccessResponse,
  NotificationUnreadCountResponse,
  ReadNotificationResponse,
} from '@/types/notification';

type NotificationQueryParams = {
  signal?: AbortSignal;
};

type GetNotificationsParams = NotificationQueryParams & {
  cursor?: string | null;
  limit?: number;
};

type NotificationMutationParams = {
  notificationId: string;
};

export function getNotifications({ cursor, limit, signal }: GetNotificationsParams = {}) {
  return apiClient<NotificationListResponse>('/backend-api/notifications', {
    method: 'GET',
    query: { cursor: cursor ?? undefined, limit: limit?.toString() },
    signal,
    cache: 'no-store',
  });
}

export function getNotificationUnreadCount({ signal }: NotificationQueryParams = {}) {
  return apiClient<NotificationUnreadCountResponse>('/backend-api/notifications/unread-count', {
    method: 'GET',
    signal,
    cache: 'no-store',
  });
}

export function markNotificationAsRead({ notificationId }: NotificationMutationParams) {
  return apiClient<ReadNotificationResponse>(
    `/backend-api/notifications/${encodeURIComponent(notificationId)}/read`,
    { method: 'PATCH' },
  );
}

export function markAllNotificationsAsRead() {
  return apiClient<NotificationSuccessResponse>('/backend-api/notifications/read-all', {
    method: 'PATCH',
  });
}

export function deleteNotification({ notificationId }: NotificationMutationParams) {
  return apiClient<NotificationSuccessResponse>(
    `/backend-api/notifications/${encodeURIComponent(notificationId)}`,
    { method: 'DELETE' },
  );
}

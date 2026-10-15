import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';

import { useCurrentUser } from '@/queries/auth/useCurrentUser';

import {
  notificationListOptions,
  notificationUnreadCountOptions,
  type NotificationListQueryParams,
  type NotificationQueryParams,
} from './notificationQueryOptions';

export function useNotifications(params: NotificationListQueryParams = {}) {
  const queryClient = useQueryClient();
  const currentUserQuery = useCurrentUser();
  const userId = currentUserQuery.isSuccess ? currentUserQuery.data.account.userId : undefined;

  return useInfiniteQuery(notificationListOptions(queryClient, { ...params, userId }));
}

export function useNotificationUnreadCount(params: NotificationQueryParams = {}) {
  const queryClient = useQueryClient();
  const currentUserQuery = useCurrentUser();
  const userId = currentUserQuery.isSuccess ? currentUserQuery.data.account.userId : undefined;

  return useQuery(notificationUnreadCountOptions(queryClient, { ...params, userId }));
}

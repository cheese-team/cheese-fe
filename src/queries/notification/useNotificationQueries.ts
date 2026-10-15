import { useInfiniteQuery, useIsMutating, useQuery, useQueryClient } from '@tanstack/react-query';

import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { notificationQueryKeys } from './notificationQueryKeys';

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
  const isMutating =
    useIsMutating({ mutationKey: notificationQueryKeys.actions(userId ?? '') }) > 0;

  return useInfiniteQuery(
    notificationListOptions(queryClient, {
      ...params,
      userId,
      autoRefresh: params.autoRefresh !== false && !isMutating,
    }),
  );
}

export function useNotificationUnreadCount(params: NotificationQueryParams = {}) {
  const queryClient = useQueryClient();
  const currentUserQuery = useCurrentUser();
  const userId = currentUserQuery.isSuccess ? currentUserQuery.data.account.userId : undefined;
  const isMutating =
    useIsMutating({ mutationKey: notificationQueryKeys.actions(userId ?? '') }) > 0;

  return useQuery(
    notificationUnreadCountOptions(queryClient, {
      ...params,
      userId,
      autoRefresh: params.autoRefresh !== false && !isMutating,
    }),
  );
}

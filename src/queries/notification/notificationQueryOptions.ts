import { infiniteQueryOptions, queryOptions, type QueryClient } from '@tanstack/react-query';

import type { CurrentUser } from '@/api/auth.api';
import { ApiError } from '@/api/client';
import { getNotificationUnreadCount, getNotifications } from '@/api/notification.api';
import { authQueryKeys } from '@/queries/auth/authQueryKeys';

import { notificationQueryKeys } from './notificationQueryKeys';

export type NotificationQueryParams = {
  enabled?: boolean;
  autoRefresh?: boolean;
};

export type NotificationListQueryParams = NotificationQueryParams & {
  limit?: number;
};

type NotificationUserParams = {
  userId?: string;
};

export const NOTIFICATION_REFETCH_INTERVAL = 30_000;

type RefreshQuery = {
  state: { error: Error | null; fetchStatus: 'fetching' | 'paused' | 'idle' };
};

function notificationRefreshOptions(
  queryClient: QueryClient,
  userId: string | undefined,
  enabled: boolean,
) {
  const canRefresh = ({ state }: RefreshQuery) =>
    enabled &&
    isCurrentNotificationUser(queryClient, userId) &&
    queryClient.isMutating({ mutationKey: notificationQueryKeys.actions(userId ?? '') }) === 0 &&
    !(state.error instanceof ApiError && state.error.status >= 400 && state.error.status < 500);

  const refetchOnReturn = (query: RefreshQuery) =>
    canRefresh(query) ? ('always' as const) : false;

  return {
    staleTime: NOTIFICATION_REFETCH_INTERVAL,
    // 오류가 있는 알림함을 다시 마운트해도 인증 실패 요청을 자동 반복하지 않는다.
    retryOnMount: false,
    refetchIntervalInBackground: false,
    refetchInterval: (query: RefreshQuery) =>
      canRefresh(query) && query.state.fetchStatus === 'idle'
        ? NOTIFICATION_REFETCH_INTERVAL
        : false,
    refetchOnWindowFocus: refetchOnReturn,
    refetchOnReconnect: refetchOnReturn,
    refetchOnMount: refetchOnReturn,
  };
}

function isCurrentNotificationUser(queryClient: QueryClient, userId: string | undefined) {
  const authState = queryClient.getQueryState<CurrentUser>(authQueryKeys.me());
  return (
    Boolean(userId) && authState?.status === 'success' && authState.data?.account.userId === userId
  );
}

async function fetchForNotificationUser<T>(
  queryClient: QueryClient,
  userId: string | undefined,
  request: () => Promise<T>,
) {
  const assertCurrentUser = () => {
    if (!isCurrentNotificationUser(queryClient, userId)) {
      throw new ApiError('로그인 정보를 다시 확인해 주세요.', 401);
    }
  };

  assertCurrentUser();
  const response = await request();
  // 계정 전환 전 시작한 요청의 응답을 이전 계정 캐시에 다시 저장하지 않는다.
  assertCurrentUser();
  return response;
}

function retryNotificationQuery(failureCount: number, error: Error) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  if (error.name === 'AbortError') return false;
  return failureCount < 1;
}

export function notificationListOptions(
  queryClient: QueryClient,
  {
    userId,
    enabled = true,
    autoRefresh = true,
    limit = 20,
  }: NotificationListQueryParams & NotificationUserParams,
) {
  return infiniteQueryOptions({
    ...notificationRefreshOptions(queryClient, userId, enabled && autoRefresh),
    queryKey: notificationQueryKeys.list(userId ?? '', limit),
    queryFn: ({ pageParam, signal }) =>
      fetchForNotificationUser(queryClient, userId, () =>
        getNotifications({ cursor: pageParam, limit, signal }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage, _allPages, _lastPageParam, allPageParams) => {
      const cursor = lastPage.nextCursor;

      if (
        !lastPage.hasMore ||
        typeof cursor !== 'string' ||
        !cursor ||
        allPageParams.includes(cursor)
      ) {
        return undefined;
      }

      return cursor;
    },
    enabled: enabled && isCurrentNotificationUser(queryClient, userId),
    retry: retryNotificationQuery,
  });
}

export function notificationUnreadCountOptions(
  queryClient: QueryClient,
  { userId, enabled = true, autoRefresh = true }: NotificationQueryParams & NotificationUserParams,
) {
  return queryOptions({
    ...notificationRefreshOptions(queryClient, userId, enabled && autoRefresh),
    queryKey: notificationQueryKeys.unreadCount(userId ?? ''),
    queryFn: ({ signal }) =>
      fetchForNotificationUser(queryClient, userId, () => getNotificationUnreadCount({ signal })),
    enabled: enabled && isCurrentNotificationUser(queryClient, userId),
    retry: retryNotificationQuery,
  });
}

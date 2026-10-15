import { mutationOptions, type InfiniteData, type QueryClient } from '@tanstack/react-query';

import type { CurrentUser } from '@/api/auth.api';
import { ApiError } from '@/api/client';
import {
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/api/notification.api';
import { authQueryKeys } from '@/queries/auth/authQueryKeys';
import type { NotificationListResponse } from '@/types/notification';

import { notificationQueryKeys } from './notificationQueryKeys';

export type NotificationAction =
  | { type: 'read'; notificationId: string }
  | { type: 'readAll' }
  | { type: 'delete'; notificationId: string };

type NotificationPages = InfiniteData<NotificationListResponse, string | undefined>;

export function notificationMutationOptions(queryClient: QueryClient, userId: string) {
  const authQuery = queryClient.getQueryCache().find<CurrentUser>({ queryKey: authQueryKeys.me() });
  const isCurrentUser = () =>
    Boolean(userId) &&
    authQuery !== undefined &&
    queryClient.getQueryCache().find({ queryKey: authQueryKeys.me() }) === authQuery &&
    authQuery.state.status === 'success' &&
    authQuery.state.data?.account.userId === userId;

  const assertCurrentUser = () => {
    if (!isCurrentUser()) throw new ApiError('다시 로그인해 주세요.', 401);
  };

  return mutationOptions({
    mutationKey: notificationQueryKeys.actions(userId),
    retry: false,
    // 오프라인 작업을 보관했다가 다른 로그인 세션에서 재실행하지 않는다.
    networkMode: 'always',
    mutationFn: async (action: NotificationAction) => {
      assertCurrentUser();
      const userKey = notificationQueryKeys.byUser(userId);

      try {
        await queryClient.cancelQueries({ queryKey: userKey });
        assertCurrentUser();

        if (action.type === 'read') {
          const response = await markNotificationAsRead({ notificationId: action.notificationId });
          if (response.id !== action.notificationId || response.isRead !== true) {
            throw new Error('알림 읽음 처리 결과를 확인하지 못했습니다.');
          }
        } else {
          const response =
            action.type === 'readAll'
              ? await markAllNotificationsAsRead()
              : await deleteNotification({ notificationId: action.notificationId });
          if (response.success !== true) throw new Error('알림 처리 결과를 확인하지 못했습니다.');
        }

        assertCurrentUser();
        // 처리 도중 시작한 조회도 취소해 이전 응답이 성공 결과를 덮지 못하게 한다.
        await queryClient.cancelQueries({ queryKey: userKey });
        assertCurrentUser();
        queryClient.setQueriesData<NotificationPages>(
          { queryKey: notificationQueryKeys.lists(userId) },
          (data) =>
            data && {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items:
                  action.type === 'delete'
                    ? page.items.filter((item) => item.id !== action.notificationId)
                    : page.items.map((item) =>
                        action.type === 'readAll' || item.id === action.notificationId
                          ? { ...item, isRead: true }
                          : item,
                      ),
              })),
            },
        );
      } finally {
        if (isCurrentUser()) {
          // 실패한 요청도 서버에는 반영됐을 수 있어 목록을 다시 확인한다.
          // 개수는 중복 ID나 다른 기기의 읽음 처리를 고려해 직접 차감하지 않는다.
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: notificationQueryKeys.lists(userId) }),
            queryClient.invalidateQueries({
              queryKey: notificationQueryKeys.unreadCount(userId),
              refetchType: 'all',
            }),
          ]);
        }
      }

      // 조회 동기화 중 로그아웃한 경우에도 이전 작업의 성공을 새 화면에 알리지 않는다.
      assertCurrentUser();
    },
  });
}

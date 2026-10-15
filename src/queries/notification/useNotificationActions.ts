import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  notificationMutationOptions,
  type NotificationAction,
} from './notificationMutationOptions';
import { notificationQueryKeys } from './notificationQueryKeys';

export function useNotificationActions(userId: string) {
  const queryClient = useQueryClient();
  const mutation = useMutation(notificationMutationOptions(queryClient, userId));
  const filters = { mutationKey: notificationQueryKeys.actions(userId) };
  const isPending = useIsMutating(filters) > 0;

  const execute = async (action: NotificationAction) => {
    // 렌더링 전에 연속 클릭하거나 사이드바를 다시 열어도 중복 요청하지 않는다.
    if (queryClient.isMutating(filters) > 0) return false;

    try {
      await mutation.mutateAsync(action);
      return true;
    } catch {
      return false;
    }
  };

  return {
    execute,
    isPending,
    error: mutation.error,
    action: mutation.variables,
    reset: mutation.reset,
  };
}

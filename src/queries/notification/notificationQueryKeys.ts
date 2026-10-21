export const notificationQueryKeys = {
  all: ['notifications'] as const,

  byUser: (userId: string) => [...notificationQueryKeys.all, 'user', userId] as const,
  lists: (userId: string) => [...notificationQueryKeys.byUser(userId), 'list'] as const,
  list: (userId: string, limit: number) =>
    [...notificationQueryKeys.lists(userId), { limit }] as const,
  unreadCount: (userId: string) =>
    [...notificationQueryKeys.byUser(userId), 'unread-count'] as const,
  actions: (userId: string) => [...notificationQueryKeys.byUser(userId), 'actions'] as const,
};

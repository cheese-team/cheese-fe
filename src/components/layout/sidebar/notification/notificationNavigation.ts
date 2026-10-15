import type { NotificationTarget } from '@/types/notification';

export function getNotificationTargetHref(target: NotificationTarget | null): string | null {
  if (!target || typeof target.id !== 'string' || !target.id.trim()) return null;
  // 점으로만 된 경로는 브라우저에서 상위 경로로 정규화되므로 이동 대상으로 쓰지 않는다.
  if (target.id === '.' || target.id === '..') return null;
  const id = encodeURIComponent(target.id);
  switch (target.type) {
    case 'job':
      return `/community/jobs/${id}`;
    case 'group':
      return `/community/groups/${id}`;
    case 'info':
      return `/community/info/${id}`;
    default:
      return null;
  }
}

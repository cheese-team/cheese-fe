'use client';

import { AlarmIcon } from '@/assets/icons/sidebar';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/cn';
import { useNotificationUnreadCount } from '@/queries/notification/useNotificationQueries';

import { getSidebarIconClassName, getSidebarItemClassName } from '../utils';

type NotificationNavButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function NotificationNavButton({ isOpen, onToggle }: NotificationNavButtonProps) {
  const unreadCount = useNotificationUnreadCount();
  // 실패·인증 만료 때 남은 캐시를 최신 숫자나 0개로 표시하지 않는다.
  const count = unreadCount.isSuccess ? unreadCount.data.count : undefined;
  const hasCount = typeof count === 'number' && Number.isInteger(count) && count >= 0;
  const label = hasCount
    ? count > 0
      ? `알림, 읽지 않은 알림 ${count}개`
      : '알림, 읽지 않은 알림 없음'
    : unreadCount.isError
      ? unreadCount.error instanceof ApiError && unreadCount.error.status === 401
        ? '알림, 로그인이 필요합니다'
        : '알림, 미읽음 개수를 확인하지 못했습니다'
      : '알림';

  return (
    <button
      type="button"
      aria-pressed={isOpen}
      aria-label={label}
      title={label}
      onClick={() => {
        onToggle();
        // 사용자가 알림함을 열면 오류 후에도 직접 다시 확인할 수 있다.
        if (!isOpen && !unreadCount.isFetching) void unreadCount.refetch({ cancelRefetch: false });
      }}
      className={cn('h-[38px] gap-2 p-1', getSidebarItemClassName(isOpen))}
    >
      <span className={cn('h-[30px] w-[30px]', getSidebarIconClassName(isOpen))}>
        <AlarmIcon width={16} height={20} aria-hidden="true" className="shrink-0" />
      </span>
      <span>알림</span>
      {hasCount && count > 0 ? (
        <span
          aria-hidden="true"
          className="bg-secondary-600 mr-2 ml-auto flex h-[20px] min-w-[20px] items-center justify-center rounded-full px-[6px] text-[11px] leading-none font-bold text-white tabular-nums"
        >
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </button>
  );
}

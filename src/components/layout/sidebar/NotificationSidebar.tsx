'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { ApiError } from '@/api/client';
import DoubleArrowIcon from '@/assets/icons/problem/double-arrow.svg';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useNotifications } from '@/queries/notification/useNotificationQueries';

import { NotificationCard } from './notification/NotificationCard';
import { groupNotifications } from './notification/notificationModel';

type NotificationSidebarProps = {
  onClose: () => void;
};

const retryButtonClassName =
  'rounded-[5px] border border-gray-300 px-[12px] py-[6px] text-[12px] text-gray-700 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-secondary-600 disabled:cursor-wait disabled:opacity-50';

function NotificationFeedback({
  message,
  isError = false,
  isRetrying = false,
  onRetry,
  showLogin = false,
}: {
  message: string;
  isError?: boolean;
  isRetrying?: boolean;
  onRetry?: () => void;
  showLogin?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-[12px] py-[24px] text-center">
      <p role={isError ? 'alert' : 'status'} className="text-[14px] leading-[24px] text-gray-600">
        {message}
      </p>
      {showLogin ? (
        <Link href="/login" className={retryButtonClassName}>
          로그인하기
        </Link>
      ) : onRetry ? (
        <button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          className={retryButtonClassName}
        >
          {isRetrying ? '다시 불러오는 중…' : '다시 시도'}
        </button>
      ) : null}
    </div>
  );
}

function NotificationList() {
  const notifications = useNotifications();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { unread, read } = useMemo(
    () => groupNotifications(notifications.data?.pages ?? []),
    [notifications.data],
  );

  const retry = () => {
    if (!notifications.isFetching) void notifications.refetch();
  };
  const loadMore = () => {
    if (notifications.hasNextPage && !notifications.isFetching) {
      void notifications.fetchNextPage({ cancelRefetch: false });
    }
  };

  // 인증/권한 오류에서는 이전에 받은 알림도 표시하지 않는다.
  if (notifications.error instanceof ApiError) {
    if (notifications.error.status === 401) {
      return <NotificationFeedback message="다시 로그인해 주세요." isError showLogin />;
    }
    if (notifications.error.status === 403) {
      return <NotificationFeedback message="알림을 확인할 권한이 없습니다." isError />;
    }
  }

  if (!notifications.data) {
    return notifications.isError ? (
      <NotificationFeedback
        message="알림을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
        isError
        isRetrying={notifications.isFetching}
        onRetry={retry}
      />
    ) : (
      <NotificationFeedback message="알림을 불러오는 중입니다…" />
    );
  }

  const isEmpty = unread.length + read.length === 0;

  return (
    <div className="flex w-full min-w-0 flex-col gap-[20px]">
      {notifications.isRefetchError && !notifications.isFetchNextPageError ? (
        <NotificationFeedback
          message="알림을 새로 불러오지 못했습니다."
          isError
          isRetrying={notifications.isFetching}
          onRetry={retry}
        />
      ) : null}

      {isEmpty && !notifications.isError ? (
        <NotificationFeedback
          message={
            notifications.hasNextPage
              ? '불러온 알림이 없습니다. 다음 알림을 확인해 주세요.'
              : '아직 받은 알림이 없습니다.'
          }
        />
      ) : null}

      {[
        { title: '읽지 않음', items: unread },
        { title: '읽음', items: read },
      ].map(({ title, items }) =>
        items.length > 0 ? (
          <section
            key={title}
            aria-label={title}
            className="flex w-full min-w-0 flex-col gap-[8px]"
          >
            <h3 className="px-[20px] text-[14px] leading-[30px] font-medium text-gray-500">
              {title}
            </h3>
            {items.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                expanded={expandedId === item.id}
                onToggleExpand={() =>
                  setExpandedId((previous) => (previous === item.id ? null : item.id))
                }
              />
            ))}
          </section>
        ) : null,
      )}

      {notifications.isFetchNextPageError ? (
        <p role="alert" className="text-center text-[14px] leading-[24px] text-gray-600">
          다음 알림을 불러오지 못했습니다. 다시 시도해 주세요.
        </p>
      ) : null}
      {notifications.isFetchingNextPage ? (
        <p role="status" className="sr-only">
          다음 알림을 불러오는 중입니다.
        </p>
      ) : null}
      {notifications.hasNextPage ? (
        <button
          type="button"
          onClick={loadMore}
          disabled={notifications.isFetching}
          className={retryButtonClassName}
        >
          {notifications.isFetchingNextPage
            ? '불러오는 중…'
            : notifications.isFetchNextPageError
              ? '다음 알림 다시 시도'
              : '알림 더 보기'}
        </button>
      ) : null}
    </div>
  );
}

export function NotificationSidebar({ onClose }: NotificationSidebarProps) {
  const currentUser = useCurrentUser();
  const needsLogin = currentUser.error instanceof ApiError && currentUser.error.status === 401;

  return (
    <aside
      aria-label="알림"
      className="box-border flex h-dvh w-[388px] shrink-0 flex-col gap-[20px] overflow-x-hidden overflow-y-auto border-r-2 border-gray-300 bg-gray-50 p-[20px] shadow-[0_4px_25px_rgba(85,85,85,0.1)]"
    >
      <header className="flex min-h-[30px] w-full shrink-0 items-center justify-between">
        <h2 className="text-[16px] leading-[30px] font-bold text-gray-950">알림</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="알림 사이드바 닫기"
          className="focus-visible:outline-secondary-600 flex h-[30px] w-[24px] items-center justify-center text-gray-500 focus-visible:outline-2"
        >
          <DoubleArrowIcon
            aria-hidden="true"
            className="block h-[20px] w-[16px] shrink-0 rotate-180"
          />
        </button>
      </header>

      {currentUser.isPending ? (
        <NotificationFeedback message="알림을 불러오는 중입니다…" />
      ) : currentUser.isError ? (
        <NotificationFeedback
          message={needsLogin ? '다시 로그인해 주세요.' : '로그인 정보를 확인하지 못했습니다.'}
          isError
          showLogin={needsLogin}
          isRetrying={currentUser.isFetching}
          onRetry={() => {
            if (!currentUser.isFetching) void currentUser.refetch();
          }}
        />
      ) : (
        <NotificationList key={currentUser.data.account.userId} />
      )}
    </aside>
  );
}

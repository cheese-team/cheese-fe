'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';

import { ApiError } from '@/api/client';
import { PublicProfileModal } from '@/components/common/PublicProfile/PublicProfileModal';
import DoubleArrowIcon from '@/assets/icons/problem/double-arrow.svg';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import type { NotificationAction } from '@/queries/notification/notificationMutationOptions';
import { useNotificationActions } from '@/queries/notification/useNotificationActions';
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

function NotificationList({ userId, onNavigate }: { userId: string; onNavigate: () => void }) {
  const notifications = useNotifications();
  const actions = useNotificationActions(userId);
  const listRef = useRef<HTMLDivElement>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<{
    userId: string;
    trigger: HTMLButtonElement;
  } | null>(null);
  const { unread, read } = useMemo(
    () => groupNotifications(notifications.data?.pages ?? []),
    [notifications.data],
  );

  const retry = () => {
    if (!notifications.isFetching) void notifications.refetch();
  };
  const loadMore = () => {
    if (notifications.hasNextPage && !notifications.isFetching && !actions.isPending) {
      void notifications.fetchNextPage({ cancelRefetch: false });
    }
  };

  const runAction = async (action: NotificationAction) => {
    const succeeded = await actions.execute(action);
    if (succeeded) {
      if (action.type === 'delete') {
        setExpandedId((previous) => (previous === action.notificationId ? null : previous));
      }
      requestAnimationFrame(() => {
        // 읽음 그룹으로 이동하거나 삭제되어 포커스된 버튼이 사라진 경우만 복원한다.
        if (document.activeElement === document.body)
          listRef.current?.focus({ preventScroll: true });
      });
    }
    return succeeded;
  };

  // 인증/권한 오류에서는 이전에 받은 알림도 표시하지 않는다.
  const errors = [notifications.error, actions.error];
  if (errors.some((error) => error instanceof ApiError && error.status === 401)) {
    return <NotificationFeedback message="다시 로그인해 주세요." isError showLogin />;
  }
  if (errors.some((error) => error instanceof ApiError && error.status === 403)) {
    return <NotificationFeedback message="알림을 확인할 권한이 없습니다." isError />;
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
  const actionsDisabled = actions.isPending || notifications.isFetching;
  const actionLabel = actions.action?.type === 'delete' ? '알림 삭제' : '읽음 처리';

  return (
    <div
      ref={listRef}
      role="region"
      aria-label="알림 목록"
      tabIndex={-1}
      className="flex w-full min-w-0 flex-col gap-[20px] outline-none"
    >
      {!isEmpty || notifications.hasNextPage ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void runAction({ type: 'readAll' })}
            disabled={actionsDisabled || (unread.length === 0 && !notifications.hasNextPage)}
            title="불러오지 않은 알림까지 모두 읽음 처리"
            className={retryButtonClassName}
          >
            모두 읽음
          </button>
        </div>
      ) : null}
      {actions.isPending ? (
        <p role="status" className="text-[12px] text-gray-600">
          알림을 처리하는 중입니다…
        </p>
      ) : null}
      {actions.error ? (
        <div className="flex items-start justify-between gap-[8px] rounded-[5px] border border-gray-300 p-[12px]">
          <p role="alert" className="text-[14px] leading-[24px] text-gray-700">
            {actions.error instanceof ApiError && actions.error.status === 404
              ? '이미 삭제되었거나 찾을 수 없는 알림입니다. 목록을 다시 확인해 주세요.'
              : `${actionLabel}에 실패했습니다. 다시 시도해 주세요.`}
          </p>
          <button
            type="button"
            onClick={actions.reset}
            aria-label="알림 처리 오류 닫기"
            className="shrink-0 text-[12px] text-gray-600"
          >
            닫기
          </button>
        </div>
      ) : null}
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
                actionsDisabled={actionsDisabled}
                onRead={() => void runAction({ type: 'read', notificationId: item.id })}
                onDelete={() => runAction({ type: 'delete', notificationId: item.id })}
                onNavigate={onNavigate}
                onOpenProfile={(senderId, trigger) =>
                  setSelectedProfile({ userId: senderId, trigger })
                }
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
          disabled={notifications.isFetching || actions.isPending}
          className={retryButtonClassName}
        >
          {notifications.isFetchingNextPage
            ? '불러오는 중…'
            : notifications.isFetchNextPageError
              ? '다음 알림 다시 시도'
              : '알림 더 보기'}
        </button>
      ) : null}
      {selectedProfile ? (
        <PublicProfileModal
          key={selectedProfile.userId}
          viewerId={userId}
          userId={selectedProfile.userId}
          trigger={selectedProfile.trigger}
          onClose={() => setSelectedProfile(null)}
        />
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
        <NotificationList
          key={currentUser.data.account.userId}
          userId={currentUser.data.account.userId}
          onNavigate={onClose}
        />
      )}
    </aside>
  );
}

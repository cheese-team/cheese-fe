'use client';

import { useId } from 'react';

import ProfileImage from '@/components/common/ProfileImage';
import { cn } from '@/lib/cn';

import { NotificationActions } from './NotificationActions';
import type { NotificationItem } from './notificationModel';

/** 발신자의 사용자 ID가 있는 알림에서는 아바타로 공개 프로필을 열 수 있다. */
export function NotificationCard({
  item,
  expanded,
  onToggleExpand,
  mutationsDisabled,
  isActionPending,
  onRead,
  onDelete,
  viewerId,
  onOpenProfile,
}: {
  item: NotificationItem;
  expanded: boolean;
  onToggleExpand: () => void;
  mutationsDisabled: boolean;
  isActionPending: boolean;
  onRead: () => void;
  onDelete: () => Promise<boolean>;
  viewerId: string;
  onOpenProfile: (userId: string, trigger: HTMLButtonElement) => void;
}) {
  const messageId = useId();

  const senderId = item.sender?.userId?.trim();
  const avatar = <ProfileImage src={item.sender?.profileImageUrl} alt="" size={25} />;

  return (
    <article className="group relative box-border w-full min-w-0 border-b border-gray-300 py-[12px]">
      <div className="absolute top-[12px] left-0">
        {senderId ? (
          <button
            type="button"
            aria-label={`${item.senderName} 프로필 보기`}
            onClick={(event) => onOpenProfile(senderId, event.currentTarget)}
            className="focus-visible:outline-secondary-600 rounded-full focus-visible:outline-2"
          >
            {avatar}
          </button>
        ) : (
          avatar
        )}
      </div>

      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={messageId}
        onClick={onToggleExpand}
        className={cn(
          'focus-visible:ring-secondary-600 flex w-full min-w-0 flex-col items-stretch text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          expanded ? 'gap-[4px]' : 'gap-[14px]',
        )}
      >
        <span className="flex min-h-[25px] w-full min-w-0 items-center gap-[12px] pl-[37px]">
          <span className="min-w-0 flex-1 truncate text-[14px] leading-[24px] font-medium text-gray-950">
            {item.senderName}
          </span>
          <span className="flex shrink-0 items-center gap-[8px] group-focus-within:opacity-0 group-hover:opacity-0 max-md:opacity-0">
            <time dateTime={item.dateTime} className="text-[12px] leading-[24px] text-gray-700">
              {item.dateLabel}
            </time>
            <span
              aria-hidden="true"
              className={cn(
                'h-[8px] w-[8px] rounded-full',
                item.isRead ? 'bg-gray-400' : 'bg-secondary-600',
              )}
            />
            <span className="sr-only">{item.isRead ? '읽음' : '읽지 않음'}</span>
          </span>
        </span>
        <span className="flex w-full min-w-0 items-start gap-[4px] text-[14px] leading-[24px]">
          <span className="shrink-0 font-medium text-gray-950">[{item.category}]</span>
          <span
            id={messageId}
            className={cn(
              'min-w-0 flex-1 font-normal text-gray-600',
              expanded ? 'wrap-anywhere whitespace-pre-line' : 'truncate',
            )}
          >
            {item.message}
          </span>
        </span>
      </button>

      <NotificationActions
        isRead={item.isRead}
        mutationsDisabled={mutationsDisabled}
        isActionPending={isActionPending}
        onRead={onRead}
        onDelete={onDelete}
        viewerId={viewerId}
        senderId={senderId}
      />
    </article>
  );
}

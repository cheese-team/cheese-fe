'use client';

import { useId } from 'react';

import ProfileImage from '@/components/common/ProfileImage';
import { cn } from '@/lib/cn';

import type { NotificationItem } from './notificationModel';

export function NotificationCard({
  item,
  expanded,
  onToggleExpand,
}: {
  item: NotificationItem;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const messageId = useId();

  return (
    <article className="relative box-border w-full min-w-0 border-b border-gray-300 py-[12px]">
      <div className="absolute top-[12px] left-0">
        <ProfileImage src={item.sender?.profileImageUrl} alt="" size={25} />
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
          <span className="flex shrink-0 items-center gap-[8px]">
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
    </article>
  );
}

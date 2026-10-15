import type {
  InAppNotification,
  NotificationListResponse,
  NotificationTargetType,
  NotificationType,
} from '@/types/notification';

export type NotificationItem = InAppNotification & {
  senderName: string;
  category: string;
  dateLabel: string;
  dateTime?: string;
};

const targetLabels: Record<NotificationTargetType, string> = {
  job: '채용공고',
  group: '그룹모집',
  info: '정보/자료공유',
};

const typeLabels: Record<NotificationType, string> = {
  jobApply: '채용공고',
  groupApply: '그룹모집',
  comment: '댓글',
  serviceUpdate: '업데이트',
};

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Seoul',
});

export function toNotificationItem(notification: InAppNotification): NotificationItem {
  const date = new Date(notification.createdAt);
  const hasValidDate = !Number.isNaN(date.getTime());

  return {
    ...notification,
    senderName:
      notification.sender?.nickname.trim() ||
      (notification.type === 'serviceUpdate' ? '치즈' : '알림'),
    category:
      (notification.type === 'serviceUpdate'
        ? typeLabels.serviceUpdate
        : notification.target && targetLabels[notification.target.type]) ||
      typeLabels[notification.type] ||
      '알림',
    dateLabel: hasValidDate ? dateFormatter.format(date) : '날짜 정보 없음',
    dateTime: hasValidDate ? date.toISOString() : undefined,
  };
}

export function groupNotifications(pages: readonly NotificationListResponse[]) {
  const seen = new Set<string>();
  const unread: NotificationItem[] = [];
  const read: NotificationItem[] = [];

  // 페이지 경계에 같은 알림이 겹쳐도 앞 페이지의 데이터와 서버 정렬 순서를 유지한다.
  for (const page of pages) {
    for (const notification of page.items) {
      if (seen.has(notification.id)) continue;
      seen.add(notification.id);
      const item = toNotificationItem(notification);
      (item.isRead ? read : unread).push(item);
    }
  }

  return { unread, read };
}

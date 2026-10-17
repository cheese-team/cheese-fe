export type NotificationType = 'jobApply' | 'groupApply' | 'comment' | 'serviceUpdate';

export type NotificationTargetType = 'job' | 'group' | 'info';

export type NotificationSender = {
  id: number;
  nickname: string;
  profileImageUrl?: string;
};

export type NotificationTarget = {
  type: NotificationTargetType;
  id: string;
};

export type InAppNotification = {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender: NotificationSender | null;
  target: NotificationTarget | null;
};

export type NotificationListResponse = {
  items: InAppNotification[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type NotificationUnreadCountResponse = {
  count: number;
};

export type ReadNotificationResponse = {
  id: string;
  isRead: boolean;
};

export type NotificationSuccessResponse = {
  success: boolean;
};

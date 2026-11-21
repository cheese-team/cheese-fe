export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export type ReportListItem = {
  id: string;
  targetType: 'jobs' | 'groups' | 'info' | 'comment';
  targetId: string;
  reason: string;
  status: ReportStatus;
  reporter: { id: string; nickname: string };
  createdAt: string;
};

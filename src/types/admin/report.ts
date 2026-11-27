import type { CommunityReportTargetType } from '@/types/community/report';

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

type ReportUser = { id: string; nickname: string };

export type ReportListItem = {
  id: string;
  targetType: CommunityReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  reporter: ReportUser | null;
  resolvedBy: ReportUser | null;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminReportsResponse = {
  items: ReportListItem[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type UpdateAdminReportRequest = { resolution: string } & (
  | { status: 'resolved'; action?: 'delete_target' }
  | { status: 'dismissed'; action?: never }
);

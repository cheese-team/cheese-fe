import type { ReportStatus } from '@/types/admin/report';

export const adminReportQueryKeys = {
  all: ['admin', 'reports'] as const,
  list: (status?: ReportStatus) => [...adminReportQueryKeys.all, status ?? 'all'] as const,
};

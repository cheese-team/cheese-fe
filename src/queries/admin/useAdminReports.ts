import { useInfiniteQuery } from '@tanstack/react-query';

import { getAdminReports } from '@/api/adminReports.api';
import { adminReportQueryKeys } from './adminReportQueryKeys';

import type { ReportStatus } from '@/types/admin/report';

export function useAdminReports(status?: ReportStatus) {
  return useInfiniteQuery({
    queryKey: adminReportQueryKeys.list(status),
    queryFn: ({ pageParam, signal }) => getAdminReports({ status, cursor: pageParam, signal }),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => (page.hasMore ? page.nextCursor : null),
  });
}

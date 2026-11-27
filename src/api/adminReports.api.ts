import { apiClient } from '@/api/client';

import type {
  AdminReportsResponse,
  ReportStatus,
  UpdateAdminReportRequest,
} from '@/types/admin/report';

type AdminReportsParams = {
  status?: ReportStatus;
  cursor?: string | null;
  limit?: number;
  signal?: AbortSignal;
};

export function getAdminReports({ status, cursor, limit = 20, signal }: AdminReportsParams) {
  return apiClient<AdminReportsResponse>('/backend-api/admin/reports', {
    method: 'GET',
    query: { status, cursor: cursor ?? undefined, limit: String(limit) },
    signal,
  });
}

export function updateAdminReport(reportId: string, request: UpdateAdminReportRequest) {
  return apiClient(`/backend-api/admin/reports/${encodeURIComponent(reportId)}`, {
    method: 'PATCH',
    body: JSON.stringify(request),
    responseType: 'void',
  });
}

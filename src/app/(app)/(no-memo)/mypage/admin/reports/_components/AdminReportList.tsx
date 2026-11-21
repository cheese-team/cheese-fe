'use client';

import { useSearchParams } from 'next/navigation';

import CommunityListState from '@/app/(app)/community/_components/CommunityListState';
import { Button } from '@/components/common/Button';
import CategoryTabs from '@/components/common/CategoryTabs';
import { useUpdateSearchParams } from '@/hooks/useUpdateSearchParams';
import { MOCK_REPORTS } from '../_constants/mockReports';
import type { ReportStatus } from '../_types/report';

const REPORT_STATUS_TABS = [
  { label: '전체', value: 'all' },
  { label: '처리 대기', value: 'pending' },
  { label: '처리 완료', value: 'resolved' },
  { label: '기각', value: 'dismissed' },
] as const;

const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: '처리 대기',
  resolved: '처리 완료',
  dismissed: '기각',
};

const TARGET_TYPE_LABELS = {
  jobs: '채용공고',
  groups: '그룹모집',
  info: '정보/자료공유',
  comment: '댓글',
};

type ReportStatusFilter = (typeof REPORT_STATUS_TABS)[number]['value'];

export default function AdminReportList() {
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const statusFilter =
    REPORT_STATUS_TABS.find((tab) => tab.value === searchParams.get('status'))?.value ?? 'all';
  const reports = MOCK_REPORTS.filter(
    (report) => statusFilter === 'all' || report.status === statusFilter,
  );

  const handleStatusChange = (status: ReportStatusFilter) => {
    updateSearchParams({ status: status === 'all' ? null : status });
  };

  return (
    <section className="flex flex-col gap-5" aria-label="신고 관리">
      <CategoryTabs
        items={REPORT_STATUS_TABS}
        activeValue={statusFilter}
        onChange={handleStatusChange}
        size="sm"
        className="flex-wrap"
      />
      {reports.length === 0 && (
        <CommunityListState type="empty" message="해당 상태의 신고가 없습니다." />
      )}
      <ul className="flex flex-col gap-4">
        {reports.map((report) => (
          <li key={report.id} className="border-border rounded-[10px] border p-5">
            <article className="flex flex-col gap-4">
              <h2 className="font-medium break-all">신고 번호(ID): {report.id}</h2>
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
                <dt className="text-text-muted">신고 대상</dt>
                <dd>{TARGET_TYPE_LABELS[report.targetType]}</dd>
                <dt className="text-text-muted">
                  {report.targetType === 'comment' ? '댓글' : '게시글'} ID
                </dt>
                <dd className="break-all">
                  {report.targetType === 'comment' ? (
                    <>{report.targetId}</>
                  ) : (
                    <span className="text-secondary-700 underline underline-offset-2">
                      {report.targetId} (원본 게시글)
                    </span>
                  )}
                </dd>
                <dt className="text-text-muted">신고 사유</dt>
                <dd className="break-words whitespace-pre-wrap">{report.reason}</dd>
                <dt className="text-text-muted">신고자 닉네임(ID)</dt>
                <dd className="break-words">
                  {report.reporter?.nickname ?? '알 수 없음'} ({report.reporter?.id})
                </dd>
                <dt className="text-text-muted">상태</dt>
                <dd>{REPORT_STATUS_LABELS[report.status]}</dd>
                <dt className="text-text-muted">신고 일시</dt>
                <dd>
                  <time dateTime={report.createdAt}>
                    {new Date(report.createdAt).toLocaleString('ko-KR', {
                      timeZone: 'Asia/Seoul',
                    })}
                  </time>
                </dd>
              </dl>
              {report.status === 'pending' && (
                <div className="flex flex-wrap gap-2">
                  <Button size={36} paddingX={16}>
                    신고 승인
                  </Button>

                  <Button variant="gray" size={36} paddingX={16}>
                    신고 기각
                  </Button>

                  <Button variant="outlineGray" size={36} paddingX={16}>
                    중복 신고 처리
                  </Button>
                </div>
              )}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import CommunityListState from '@/app/(app)/community/_components/CommunityListState';
import { ApiError } from '@/api/client';
import { Chip } from '@/components/common/Chip';
import { Button } from '@/components/common/Button';
import CategoryTabs from '@/components/common/CategoryTabs';

import { useUpdateSearchParams } from '@/hooks/useUpdateSearchParams';

import { useAdminReports } from '@/queries/admin/useAdminReports';
import { useUpdateAdminReport } from '@/queries/admin/useUpdateAdminReport';

import type { ReportListItem, ReportStatus, UpdateAdminReportRequest } from '@/types/admin/report';

const REPORT_STATUS_TABS = [
  { label: '전체', value: 'all' },
  { label: '처리 대기', value: 'pending' },
  { label: '처리 완료', value: 'resolved' },
  { label: '신고 기각', value: 'dismissed' },
] as const;

const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: '처리 대기',
  resolved: '처리 완료',
  dismissed: '기각',
};

const REPORT_STATUS_STYLES: Record<ReportStatus, string> = {
  pending: 'bg-tag-yellow-100',
  resolved: 'bg-tag-green-100',
  dismissed: 'bg-gray-200',
};

const TARGET_TYPE_LABELS = {
  jobs: '채용공고',
  groups: '그룹모집',
  info: '정보/자료공유',
  comment: '댓글',
};

type ReportStatusFilter = (typeof REPORT_STATUS_TABS)[number]['value'];

function formatReportTime(date: string) {
  return new Date(date).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
}

const TARGET_NOT_FOUND = /^(?:comment|job post|group post|info post) not found\.?$/i;

export default function AdminReportsPage() {
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const statusFilter =
    REPORT_STATUS_TABS.find((tab) => tab.value === searchParams.get('status'))?.value ?? 'all';
  const list = useAdminReports(statusFilter === 'all' ? undefined : statusFilter);
  const reports = list.data?.pages.flatMap((page) => page.items) ?? [];
  const { fetchNextPage, hasNextPage, isFetching, isError } = list;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);
  const { mutateAsync, isPending: isUpdating } = useUpdateAdminReport();

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetching || isError) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void fetchNextPage({ cancelRefetch: false });
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching, isError]);

  const handleUpdate = async (report: ReportListItem, defaults: UpdateAdminReportRequest) => {
    if (report.status !== 'pending' || isUpdating || isSubmittingRef.current) return;

    const input = window.prompt('신고 처리 사유를 입력해 주세요.', defaults.resolution);
    if (input === null) return;

    const resolution = input.trim();
    if (!resolution) {
      window.alert('신고 처리 사유를 입력해 주세요.');
      return;
    }
    if (defaults.action === 'delete_target' && !window.confirm('신고 대상을 삭제하시겠습니까?'))
      return;

    isSubmittingRef.current = true;
    try {
      await mutateAsync({ report, request: { ...defaults, resolution } });
      window.alert('신고가 처리되었습니다.');
    } catch (error) {
      if (
        defaults.action === 'delete_target' &&
        error instanceof ApiError &&
        error.status === 404 &&
        TARGET_NOT_FOUND.test(error.message)
      ) {
        window.alert(
          '신고 대상을 찾을 수 없습니다.\n이미 삭제된 대상이라면 중복 신고 처리를 이용해 주세요.',
        );
      } else {
        window.alert(error instanceof ApiError ? error.message : '신고 처리에 실패했습니다.');
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

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

      {list.isPending && (
        <CommunityListState type="loading" message="신고 목록을 불러오는 중입니다." />
      )}

      {list.isError && !list.isFetchNextPageError && (
        <CommunityListState
          type="error"
          message="신고 목록을 불러오지 못했습니다."
          onRetry={() => {
            void list.refetch();
          }}
        />
      )}

      {list.isSuccess && reports.length === 0 && (
        <CommunityListState type="empty" message="해당 상태의 신고가 없습니다." />
      )}

      <ul className="flex flex-col gap-4">
        {reports.map((report) => (
          <li key={report.id} className="border-border rounded-[10px] border p-5">
            <article className="flex flex-col gap-4">
              <div className="flex items-start gap-2">
                <Chip className={REPORT_STATUS_STYLES[report.status]}>
                  {REPORT_STATUS_LABELS[report.status]}
                </Chip>
                <h2 className="font-medium break-all">신고 번호(ID): {report.id}</h2>
              </div>

              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
                <dt className="text-text-muted">분류</dt>
                <dd>{TARGET_TYPE_LABELS[report.targetType]}</dd>

                <dt className="text-text-muted">
                  {report.targetType === 'comment' ? '댓글' : '게시글'} ID
                </dt>
                <dd className="break-all">
                  {report.targetType === 'comment' ? (
                    <>{report.targetId}</>
                  ) : (
                    <Link
                      href={`/community/${report.targetType}/${encodeURIComponent(report.targetId)}`}
                      className="text-secondary-700 underline underline-offset-2"
                    >
                      {report.targetId}
                    </Link>
                  )}
                </dd>

                <dt className="text-text-muted">신고 사유</dt>
                <dd className="wrap-anywhere whitespace-pre-wrap">{report.reason}</dd>

                <dt className="text-text-muted">신고자 닉네임(ID)</dt>
                <dd className="wrap-anywhere">
                  {report.reporter
                    ? `${report.reporter.nickname} (${report.reporter.id})`
                    : '알 수 없음'}
                </dd>

                <dt className="text-text-muted">신고 일시</dt>
                <dd>
                  <time dateTime={report.createdAt}>{formatReportTime(report.createdAt)}</time>
                </dd>
              </dl>

              {report.status !== 'pending' && (
                <dl className="border-border grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 border-t pt-4 text-sm">
                  <dt className="text-text-muted">처리 사유</dt>
                  <dd className="wrap-anywhere whitespace-pre-wrap">{report.resolution ?? '-'}</dd>

                  <dt className="text-text-muted">처리 일시</dt>
                  <dd>
                    <time dateTime={report.updatedAt}>{formatReportTime(report.updatedAt)}</time>
                  </dd>
                </dl>
              )}

              {report.status === 'pending' && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size={36}
                    paddingX={16}
                    disabled={isUpdating}
                    onClick={() => {
                      void handleUpdate(report, {
                        status: 'resolved',
                        resolution: '운영 정책 위반으로 신고 대상을 삭제했습니다.',
                        action: 'delete_target',
                      });
                    }}
                  >
                    신고 승인
                  </Button>

                  <Button
                    variant="gray"
                    size={36}
                    paddingX={16}
                    disabled={isUpdating}
                    onClick={() => {
                      void handleUpdate(report, {
                        status: 'dismissed',
                        resolution: '운영 정책 위반에 해당하지 않아 신고를 기각합니다.',
                      });
                    }}
                  >
                    신고 기각
                  </Button>

                  <Button
                    variant="outlineGray"
                    size={36}
                    paddingX={16}
                    disabled={isUpdating}
                    onClick={() => {
                      void handleUpdate(report, {
                        status: 'resolved',
                        resolution: '이미 처리된 신고 대상입니다.',
                      });
                    }}
                  >
                    중복 신고 처리
                  </Button>
                </div>
              )}
            </article>
          </li>
        ))}
      </ul>
      <div ref={loadMoreRef} className="h-px" />

      {list.isFetchingNextPage && (
        <CommunityListState type="loading" message="신고 목록을 더 불러오는 중입니다." />
      )}

      {list.isFetchNextPageError && (
        <CommunityListState
          type="error"
          message="추가 신고 목록을 불러오지 못했습니다."
          onRetry={() => {
            void fetchNextPage({ cancelRefetch: false });
          }}
        />
      )}
    </section>
  );
}

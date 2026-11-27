'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import CommunityListState from '@/app/(app)/community/_components/CommunityListState';
import { ApiError } from '@/api/client';
import { Chip } from '@/components/common/Chip';
import { Button } from '@/components/common/Button';
import CategoryTabs from '@/components/common/CategoryTabs';
import MypageListFilterBar from '../../_components/MypageListFilterBar';
import AdminReportModal from './_components/AdminReportModal';

import { useUpdateSearchParams } from '@/hooks/useUpdateSearchParams';
import { useSearchHistories } from '@/hooks/useSearchHistories';

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

const TARGET_TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'jobs', label: TARGET_TYPE_LABELS.jobs },
  { value: 'groups', label: TARGET_TYPE_LABELS.groups },
  { value: 'info', label: TARGET_TYPE_LABELS.info },
  { value: 'comment', label: TARGET_TYPE_LABELS.comment },
] as const;

const EMPTY_SEARCH_HISTORIES: readonly string[] = [];

const REPORT_ACTIONS = {
  approve: {
    title: '신고 승인',
    description: '신고 승인 시 해당 게시글 또는 댓글이 삭제됩니다.',
    request: {
      status: 'resolved',
      action: 'delete_target',
    },
  },
  dismiss: {
    title: '신고 기각',
    description: '신고 대상은 삭제되지 않으며 신고가 기각됩니다.',
    request: {
      status: 'dismissed',
    },
  },
  close: {
    title: '신고 종결',
    description: '추가 조치 없이 신고를 처리 완료 상태로 변경합니다.',
    request: {
      status: 'resolved',
    },
  },
} satisfies Record<
  string,
  { title: string; description: string; request: Omit<UpdateAdminReportRequest, 'resolution'> }
>;

type ReportAction = keyof typeof REPORT_ACTIONS;

type ReportStatusFilter = (typeof REPORT_STATUS_TABS)[number]['value'];

function formatReportTime(date: string) {
  return new Date(date).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
}

function matchesKeyword(report: ReportListItem, keyword: string) {
  const fields = [
    report.id,
    REPORT_STATUS_LABELS[report.status],
    TARGET_TYPE_LABELS[report.targetType],
    report.targetId,
    report.reason ?? '-',
    report.reporter?.nickname ?? '알 수 없음',
    report.reporter?.id,
    formatReportTime(report.createdAt),
  ];
  if (report.status !== 'pending') {
    fields.push(report.resolution ?? undefined, formatReportTime(report.updatedAt));
  }
  return fields.some((field) => field?.toLowerCase().includes(keyword));
}

const TARGET_NOT_FOUND = /^(?:comment|job post|group post|info post) not found\.?$/i;

export default function AdminReportsPage() {
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const statusFilter =
    REPORT_STATUS_TABS.find((tab) => tab.value === searchParams.get('status'))?.value ?? 'all';
  const typeFilter =
    TARGET_TYPE_OPTIONS.find((option) => option.value === searchParams.get('type'))?.value ?? 'all';
  const searchValue = searchParams.get('q')?.trim() ?? '';
  const keyword = searchValue.toLowerCase();
  const isFiltering = typeFilter !== 'all' || Boolean(keyword);
  const { histories, addHistory } = useSearchHistories('admin-reports', EMPTY_SEARCH_HISTORIES);
  const list = useAdminReports(statusFilter === 'all' ? undefined : statusFilter);
  const { fetchNextPage, hasNextPage, isFetching, isError } = list;
  const hasCompleteResults = list.isSuccess && !hasNextPage && !isFetching;
  const loadedReports = list.data?.pages.flatMap((page) => page.items) ?? [];
  const reports = isFiltering
    ? hasCompleteResults
      ? loadedReports.filter(
          (report) =>
            (typeFilter === 'all' || report.targetType === typeFilter) &&
            (!keyword || matchesKeyword(report, keyword)),
        )
      : []
    : loadedReports;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [selection, setSelection] = useState<{
    report: ReportListItem;
    action: ReportAction;
  } | null>(null);
  const selectedAction = selection ? REPORT_ACTIONS[selection.action] : null;
  const isSubmittingRef = useRef(false);
  const { mutateAsync, isPending: isUpdating } = useUpdateAdminReport();

  useEffect(() => {
    if (!hasNextPage || isFetching || isError) return;

    if (isFiltering) {
      void fetchNextPage({ cancelRefetch: false });
      return;
    }

    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void fetchNextPage({ cancelRefetch: false });
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching, isError, isFiltering, statusFilter]);

  const restoreFocus = useCallback(() => {
    const trigger = triggerRef.current;
    if (trigger?.isConnected && !trigger.disabled) trigger.focus();
    else pageRef.current?.focus();
  }, []);

  const openModal = (report: ReportListItem, action: ReportAction, trigger: HTMLButtonElement) => {
    if (report.status !== 'pending' || isUpdating || isSubmittingRef.current) return;
    triggerRef.current = trigger;
    setSelection({ report, action });
  };

  const closeModal = () => {
    if (!isUpdating && !isSubmittingRef.current) setSelection(null);
  };

  const handleUpdate = async (input: string) => {
    if (!selection || !selectedAction || isUpdating || isSubmittingRef.current) return;
    const resolution = input.trim();
    if (!resolution) return;
    const { report, action } = selection;

    isSubmittingRef.current = true;
    try {
      await mutateAsync({ report, request: { ...selectedAction.request, resolution } });
      flushSync(() => setSelection(null));
      window.alert('신고가 처리되었습니다.');
    } catch (error) {
      if (
        action === 'approve' &&
        error instanceof ApiError &&
        error.status === 404 &&
        TARGET_NOT_FOUND.test(error.message)
      ) {
        window.alert(
          '신고 대상을 찾을 수 없습니다.\n이미 삭제된 대상이라면 신고 종결을 이용해 주세요.',
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

  const handleSearchSubmit = (value: string) => {
    const query = value.trim();
    if (query) addHistory(query);
    updateSearchParams('q', query);
  };

  return (
    <section ref={pageRef} tabIndex={-1} className="flex flex-col gap-5" aria-label="신고 관리">
      <CategoryTabs
        items={REPORT_STATUS_TABS}
        activeValue={statusFilter}
        onChange={handleStatusChange}
        size="sm"
        className="flex-wrap"
      />

      <MypageListFilterBar
        sortOptions={TARGET_TYPE_OPTIONS}
        selectedSort={typeFilter}
        filterLabel="신고 대상 분류"
        onSortChange={(value) => updateSearchParams({ type: value === 'all' ? null : value })}
        searchValue={searchValue}
        searchHistories={histories}
        onSearchSubmit={handleSearchSubmit}
        onSearchClear={() => updateSearchParams('q', '')}
        searchClassName="w-full sm:w-[500px]"
        className="gap-3"
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

      {(isFiltering ? hasCompleteResults : list.isSuccess) && reports.length === 0 && (
        <CommunityListState
          type="empty"
          message={
            isFiltering ? '검색 조건에 해당하는 신고가 없습니다.' : '해당 상태의 신고가 없습니다.'
          }
        />
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
                    onClick={(event) => openModal(report, 'approve', event.currentTarget)}
                  >
                    신고 승인
                  </Button>

                  <Button
                    variant="gray"
                    size={36}
                    paddingX={16}
                    disabled={isUpdating}
                    onClick={(event) => openModal(report, 'dismiss', event.currentTarget)}
                  >
                    신고 기각
                  </Button>

                  <Button
                    variant="outlineGray"
                    size={36}
                    paddingX={16}
                    disabled={isUpdating}
                    onClick={(event) => openModal(report, 'close', event.currentTarget)}
                  >
                    신고 종결
                  </Button>
                </div>
              )}
            </article>
          </li>
        ))}
      </ul>
      {!isFiltering && <div ref={loadMoreRef} className="h-px" />}

      {(isFiltering
        ? !list.isPending && !isError && !hasCompleteResults
        : list.isFetchingNextPage) && (
        <CommunityListState
          type="loading"
          message={
            isFiltering
              ? '검색할 신고 목록을 불러오는 중입니다.'
              : '신고 목록을 더 불러오는 중입니다.'
          }
        />
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
      {selection && selectedAction && (
        <AdminReportModal
          report={selection.report}
          targetLabel={TARGET_TYPE_LABELS[selection.report.targetType]}
          title={selectedAction.title}
          action={selection.action}
          description={selectedAction.description}
          deletesTarget={selection.action === 'approve'}
          isPending={isUpdating}
          onClose={closeModal}
          onSubmit={(resolution) => {
            void handleUpdate(resolution);
          }}
          restoreFocus={restoreFocus}
        />
      )}
    </section>
  );
}

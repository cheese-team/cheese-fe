'use client';

import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { ApiError } from '@/api/client';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useCreateCommunityReport } from '@/queries/community/useCreateCommunityReport';

import type { CreateCommunityReportRequest } from '@/types/community/report';

export type ReportContentTarget = Omit<CreateCommunityReportRequest, 'reason'> & {
  authorId: string;
  authorName: string;
  content: string;
};

export function useReportContent() {
  const { data: user } = useCurrentUser();
  const { mutateAsync, isPending } = useCreateCommunityReport();

  const isReportingRef = useRef(false);

  const [reportTarget, setReportTarget] = useState<ReportContentTarget | null>(null);

  const openReportModal = (target: ReportContentTarget) => {
    if (!user || target.authorId === user.account.userId || isPending || isReportingRef.current)
      return;

    setReportTarget(target);
  };

  const closeReportModal = () => {
    if (isPending || isReportingRef.current) return;

    setReportTarget(null);
  };

  const submitReport = async (input: string) => {
    if (
      !reportTarget ||
      !user ||
      reportTarget.authorId === user.account.userId ||
      isPending ||
      isReportingRef.current
    )
      return;

    const reason = input.trim();

    if (!reason) return;

    const { targetType, targetId } = reportTarget;

    isReportingRef.current = true;

    try {
      await mutateAsync({ targetType, targetId, reason });
      flushSync(() => setReportTarget(null));
      window.alert('신고가 접수되었습니다.');
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 409 &&
        error.message === 'Report already submitted'
      ) {
        window.alert(`이미 신고한 ${targetType === 'comment' ? '댓글' : '게시글'}입니다.`);
        return;
      }
      window.alert(error instanceof ApiError ? error.message : '신고에 실패했습니다.');
    } finally {
      isReportingRef.current = false;
    }
  };

  return {
    reportTarget,
    openReportModal,
    closeReportModal,
    submitReport,
    isReportPending: isPending,
  };
}

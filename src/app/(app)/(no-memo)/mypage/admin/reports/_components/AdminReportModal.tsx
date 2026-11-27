import { useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/common/Button';
import BaseModal from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { REPORT_REASON_OPTIONS } from '@/app/(app)/community/_constants/community';
import { cn } from '@/lib/cn';

import CloseIcon from '@/assets/icons/common/close.svg';

import type { ReportListItem } from '@/types/admin/report';

const OTHER_OPTIONS = REPORT_REASON_OPTIONS.filter(({ value }) => value === 'other');

const RESOLUTION_OPTIONS = {
  approve: REPORT_REASON_OPTIONS,
  dismiss: [
    { value: 'no-violation', label: '운영 정책 위반에 해당하지 않음' },
    { value: 'insufficient', label: '신고 사유가 불충분함' },
    { value: 'inaccurate', label: '신고 내용이 사실과 다름' },
    ...OTHER_OPTIONS,
  ],
  close: [
    { value: 'already-resolved', label: '이미 처리된 신고 대상 (중복 신고 처리)' },
    { value: 'already-deleted', label: '신고 대상이 이미 삭제됨' },
    ...OTHER_OPTIONS,
  ],
};

type AdminReportModalProps = {
  report: ReportListItem & { postId?: string };
  targetLabel: string;
  title: string;
  action: keyof typeof RESOLUTION_OPTIONS;
  description: string;
  deletesTarget: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (resolution: string) => void;
  restoreFocus: () => void;
};

export default function AdminReportModal({
  report,
  targetLabel,
  title,
  action,
  description,
  deletesTarget,
  isPending,
  onClose,
  onSubmit,
  restoreFocus,
}: AdminReportModalProps) {
  const id = useId();
  const dialogRef = useRef<HTMLFormElement>(null);

  const options = RESOLUTION_OPTIONS[action];

  const matchedReason =
    action === 'approve'
      ? REPORT_REASON_OPTIONS.find(
          ({ value, label }) => value !== 'other' && label === report.reason,
        )
      : undefined;

  const [selectedReason, setSelectedReason] = useState(() =>
    action === 'approve' ? (matchedReason?.value ?? 'other') : options[0].value,
  );
  const [otherReason, setOtherReason] = useState(() =>
    action === 'approve' && !matchedReason ? report.reason : '',
  );

  const trimmedResolution =
    selectedReason === 'other'
      ? otherReason.trim()
      : (options.find(({ value }) => value === selectedReason)?.label ?? '');

  const selectId = id + '-resolution';

  useEffect(() => {
    return restoreFocus;
  }, [restoreFocus]);

  useEffect(() => {
    if (isPending) dialogRef.current?.focus();
    else document.getElementById(selectId)?.focus();
  }, [isPending, selectId]);

  return (
    <BaseModal isOpen hasOverlay onClose={onClose} closeOnEscape={!isPending}>
      <form
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        aria-busy={isPending}
        className="flex max-h-[calc(100dvh-2.5rem)] w-[480px] max-w-full flex-col gap-5 overflow-y-auto rounded-[10px] border border-gray-400 bg-white px-6 py-7"
        onSubmit={(event) => {
          event.preventDefault();
          if (!isPending && trimmedResolution) onSubmit(trimmedResolution);
        }}
        onKeyDown={(event) => {
          if (
            event.key !== 'Tab' ||
            !(event.target instanceof Node) ||
            !event.currentTarget.contains(event.target)
          )
            return;

          const dialog = event.currentTarget;
          const controls = dialog.querySelectorAll<HTMLElement>(
            'button:not(:disabled), textarea:not(:disabled)',
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (!first || !last) {
            event.preventDefault();
            dialog.focus();
          } else if (
            event.shiftKey &&
            (document.activeElement === first || document.activeElement === dialog)
          ) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id={`${id}-title`} className="text-[20px] leading-5 font-medium">
              {title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              aria-label="신고 처리 모달 닫기"
              className="flex h-5 w-5 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CloseIcon className="h-[15px] w-[15px] text-gray-700" aria-hidden="true" />
            </button>
          </div>

          <p
            id={`${id}-description`}
            className={cn('text-sm', deletesTarget && 'text-error font-medium')}
          >
            {description}
          </p>
        </div>

        <dl className="bg-bg-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-[10px] p-3 text-sm">
          <dt className="font-medium text-gray-600">신고 대상 유형</dt>
          <dd>{targetLabel}</dd>

          {report.targetType === 'comment' && report.postId && (
            <>
              <dt className="font-medium text-gray-600">게시글 ID</dt>
              <dd className="wrap-anywhere">{report.postId}</dd>
            </>
          )}

          <dt className="font-medium text-gray-600">
            {report.targetType === 'comment' ? '댓글' : '게시글'} ID
          </dt>
          <dd className="wrap-anywhere">{report.targetId}</dd>

          <dt className="font-medium text-gray-600">신고 사유</dt>
          <dd className="wrap-anywhere whitespace-pre-wrap">{report.reason}</dd>

          <dt className="font-medium text-gray-600">신고자 닉네임</dt>
          <dd className="wrap-anywhere">{report.reporter?.nickname ?? '알 수 없음'}</dd>
        </dl>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-resolution`} className="text-sm font-medium">
            신고 처리 사유
          </label>

          <Select
            id={selectId}
            options={options}
            value={selectedReason}
            onChange={setSelectedReason}
            disabled={isPending}
            triggerClassName="h-10 gap-2 px-2 data-[state=open]:rounded-none data-[state=open]:border-0 data-[state=open]:border-b-2 data-[state=open]:pl-2"
          />
          {selectedReason === 'other' && (
            <>
              <label htmlFor={`${id}-other-resolution`} className="sr-only">
                기타 처리 사유
              </label>
              <textarea
                id={`${id}-other-resolution`}
                value={otherReason}
                onChange={(event) => setOtherReason(event.target.value)}
                placeholder="처리 사유를 입력해 주세요."
                disabled={isPending}
                className="focus:outline-secondary-600 min-h-24 resize-y rounded-[5px] border border-gray-400 p-2 text-sm"
              />
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="gray"
            size={36}
            paddingX={16}
            disabled={isPending}
            onClick={onClose}
          >
            취소
          </Button>

          <Button type="submit" size={36} paddingX={16} disabled={isPending || !trimmedResolution}>
            {title}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}

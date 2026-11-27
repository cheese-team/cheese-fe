'use client';

import { useEffect, useId, useRef, useState } from 'react';

import BaseModal from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';

import { REPORT_REASON_OPTIONS } from '../_constants/community';

import CloseIcon from '@/assets/icons/common/close.svg';

import type { ReportContentTarget } from '../_hooks/useReportContent';

type ReportModalProps = {
  reportTarget: ReportContentTarget;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
};

export default function ReportModal({
  reportTarget,
  isPending,
  onClose,
  onSubmit,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const formId = useId();

  const dialogRef = useRef<HTMLDivElement>(null);

  const isComment = reportTarget.targetType === 'comment';

  const reason =
    selectedReason === 'other'
      ? otherReason.trim()
      : (REPORT_REASON_OPTIONS.find((option) => option.value === selectedReason)?.label ?? '');

  useEffect(() => {
    const previousFocus = document.activeElement;
    const frame = requestAnimationFrame(() => {
      document.getElementById(`${formId}-select`)?.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [formId]);

  const handleClose = () => {
    if (!isPending) onClose();
  };

  return (
    <BaseModal isOpen onClose={handleClose} closeOnEscape={!isPending} hasOverlay>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        aria-describedby={`${formId}-description`}
        aria-busy={isPending}
        tabIndex={-1}
        className="flex w-[393px] max-w-full flex-col gap-7 rounded-[10px] border border-gray-400 bg-white px-6 py-7"
        onKeyDown={(event) => {
          const dialog = dialogRef.current;
          if (
            event.key !== 'Tab' ||
            !dialog ||
            !(event.target instanceof Node) ||
            !dialog.contains(event.target)
          )
            return;
          const controls = dialog.querySelectorAll<HTMLElement>(
            'button:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (!first) {
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
        <div className="flex items-center justify-between">
          <h2 id={`${formId}-title`} className="text-[20px] leading-5 font-medium tracking-normal">
            신고하기
          </h2>

          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            aria-label="신고 모달 닫기"
            className="flex h-5 w-5 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CloseIcon className="h-[15px] w-[15px] text-gray-700" />
          </button>
        </div>

        <form
          id={formId}
          onSubmit={(event) => {
            event.preventDefault();
            if (!isPending && reason) onSubmit(reason);
          }}
        >
          <dl className="bg-bg-3 mb-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-[10px] p-3 text-sm">
            <dt className="font-medium text-gray-600">신고 대상</dt>
            <dd>{isComment ? '댓글' : '게시글'}</dd>

            <dt className="font-medium text-gray-600">{isComment ? '댓글 내용' : '게시글 제목'}</dt>
            <dd className="max-h-30 overflow-y-auto wrap-anywhere [scrollbar-color:var(--color-gray-500)_transparent] [scrollbar-width:thin]">
              {reportTarget.content}
            </dd>

            <dt className="font-medium text-gray-600">작성자</dt>
            <dd className="wrap-anywhere">{reportTarget.authorName}</dd>
          </dl>

          <label htmlFor={`${formId}-select`} className="sr-only">
            신고 사유
          </label>

          <Select
            id={`${formId}-select`}
            value={selectedReason}
            options={REPORT_REASON_OPTIONS}
            placeholder="신고 사유 선택"
            disabled={isPending}
            onChange={(value) => {
              setSelectedReason(value);
              setOtherReason('');
            }}
            triggerClassName="h-10 gap-2 px-2 data-[state=open]:rounded-none data-[state=open]:border-0 data-[state=open]:border-b-2 data-[state=open]:pl-2"
          />
          {selectedReason === 'other' && (
            <>
              <label htmlFor={`${formId}-other`} className="sr-only">
                기타 신고 사유
              </label>
              <textarea
                id={`${formId}-other`}
                value={otherReason}
                onChange={(event) => setOtherReason(event.target.value)}
                disabled={isPending}
                placeholder="신고 사유를 입력해 주세요."
                className="focus:outline-secondary-600 mt-3 min-h-20 w-full resize-y rounded-[5px] border border-gray-400 px-2 py-2 text-[14px]"
              />
            </>
          )}

          <p id={`${formId}-description`} className="mt-2 text-[12px] text-gray-500">
            접수된 신고는 관리자의 검토 후 처리됩니다
          </p>
        </form>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            size={28}
            paddingX={12}
            variant="gray"
            disabled={isPending}
            onClick={handleClose}
          >
            취소
          </Button>
          <Button
            type="submit"
            form={formId}
            size={28}
            paddingX={12}
            disabled={isPending || !reason}
          >
            신고하기
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}

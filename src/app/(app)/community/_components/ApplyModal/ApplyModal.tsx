'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import BaseModal from '@/components/common/Modal';
import { ApiError } from '@/api/client';

import ApplyFormContent from './ApplyFormContent';
import ApplyCompleteContent from './ApplyCompleteContent';

import CloseIcon from '@/assets/icons/common/close.svg';

import type {
  JobPost,
  JobPostDetail,
  GroupPost,
  GroupPostDetail,
} from '@/types/community/community';

export type ApplyModalProps = {
  post: JobPost | JobPostDetail | GroupPost | GroupPostDetail;
  isOpen: boolean;
  onClose: () => void;
  onApply: () => Promise<void>;
  isApplyPending?: boolean;
  isApplied?: boolean;
};

export default function ApplyModal({
  post,
  isOpen,
  onClose,
  onApply,
  isApplyPending = false,
  isApplied = false,
}: ApplyModalProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const handleApplyClick = async () => {
    if (isApplyPending || isApplied) return;

    setApplyError(null);

    try {
      await onApply();
      setIsCompleted(true);
    } catch (error) {
      setApplyError(
        error instanceof ApiError ? error.message : '지원하지 못했습니다. 다시 시도해주세요.',
      );
    }
  };

  const handleClose = () => {
    if (isApplyPending) return;
    setIsCompleted(false);
    setApplyError(null);
    onClose();
  };

  const handleMoveApplications = () => {
    onClose();
    router.push('/mypage/applications');
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      interaction="interactive"
      scope="content"
      draggable
    >
      <section className="bg-bg-white flex w-[540px] flex-col rounded-[10px] border border-gray-400 pb-15">
        <header
          data-drag-handle
          className="flex cursor-grab justify-end pt-5 pb-[10px] active:cursor-grabbing"
        >
          <button
            data-no-drag
            type="button"
            onClick={handleClose}
            disabled={isApplyPending}
            aria-label="닫기"
            className="mr-[25px] p-[7px]"
          >
            <CloseIcon className="w-4 text-gray-700" />
          </button>
        </header>

        <div className="px-8">
          {isCompleted ? (
            <ApplyCompleteContent title={post.title} onMoveApplications={handleMoveApplications} />
          ) : (
            <ApplyFormContent
              post={post}
              onClose={handleClose}
              onApply={handleApplyClick}
              isApplyPending={isApplyPending}
              isApplied={isApplied}
            />
          )}
          {applyError && (
            <p role="alert" className="text-error-subtle mt-3 text-[14px]">
              {applyError}
            </p>
          )}
        </div>
      </section>
    </BaseModal>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import BaseModal from '@/components/common/Modal';

import ApplyFormContent from './ApplyFormContent';
import ApplyCompleteContent from './ApplyCompleteContent';

import CloseIcon from '@/assets/icons/common/close.svg';

import type { JobPost, GroupPost } from '@/types/community/community';

export type ApplyModalProps = {
  post: JobPost | GroupPost;
  isOpen: boolean;
  onClose: () => void;
};

export default function ApplyModal({ post, isOpen, onClose }: ApplyModalProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);

  const handleApplyClick = () => {
    setIsCompleted(true);
  };

  const handleClose = () => {
    setIsCompleted(false);
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
            <ApplyFormContent post={post} onClose={handleClose} onApply={handleApplyClick} />
          )}
        </div>
      </section>
    </BaseModal>
  );
}

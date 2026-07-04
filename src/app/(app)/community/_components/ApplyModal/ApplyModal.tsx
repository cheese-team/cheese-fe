'use client';

import { useState } from 'react';

import { BaseModal } from '@/components/common/Modal';

import ApplyFormContent from './ApplyFormContent';
import ApplyCompleteContent from './ApplyCompleteContent';

import CloseIcon from '@/assets/icons/common/close.svg';

import type { JobPost, GroupPost } from '@/types/community';

export type ApplyModalProps = {
  post: JobPost | GroupPost;
  isOpen: boolean;
  onClose: () => void;
};

export default function ApplyModal({ post, isOpen, onClose }: ApplyModalProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleApplyClick = () => {
    setIsCompleted(true);
  };

  const handleClose = () => {
    setIsCompleted(false);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose}>
      <section className="bg-bg-white flex w-[540px] flex-col gap-[10px] rounded-xl border border-gray-400 px-8 pt-5 pb-15">
        <header className="flex justify-end">
          <button type="button" onClick={handleClose} aria-label="닫기" className="py-[7px]">
            <CloseIcon className="w-4 text-gray-700" />
          </button>
        </header>

        {isCompleted ? (
          <ApplyCompleteContent title={post.title} />
        ) : (
          <ApplyFormContent post={post} onClose={onClose} onApply={handleApplyClick} />
        )}
      </section>
    </BaseModal>
  );
}

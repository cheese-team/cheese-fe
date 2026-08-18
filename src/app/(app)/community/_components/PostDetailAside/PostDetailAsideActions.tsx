'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';

import ApplyModal from '../ApplyModal';

import LikeOutlineIcon from '@/assets/icons/common/like-outline.svg';
import LikeFilledIcon from '@/assets/icons/common/like-filled.svg';
import ShareIcon from '@/assets/icons/common/contact.svg';

import type { JobPost, GroupPost } from '@/types/community/community';

type PostDetailAsideActionsProps = {
  post: JobPost | GroupPost;
  isClosed?: boolean;
  buttonText?: string;
};

export default function PostDetailAsideActions({
  post,
  isClosed,
  buttonText = '지원하기',
}: PostDetailAsideActionsProps) {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked);

  const closedButtonText = 'apply' in post ? '채용 마감' : '모집 마감';

  const handleToggleLike = () => {
    setIsLiked((prev) => !prev);
  };

  const handleApplyClick = () => {
    if ('apply' in post) {
      if (post.apply.type === 'homepage') {
        window.open(post.apply.url, '_blank', 'noopener,noreferrer');
        return;
      }
    }

    setIsApplyModalOpen(true);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outlineGray"
        onClick={handleToggleLike}
        size={54}
        width={46}
        className="border-gray-400"
      >
        {isLiked ? (
          <LikeFilledIcon className="text-error-subtle w-[14px]" />
        ) : (
          <LikeOutlineIcon className="w-[14px] text-gray-500" />
        )}
      </Button>

      <Button
        disabled={isClosed}
        onClick={handleApplyClick}
        size={54}
        width={182}
        className="flex gap-3"
      >
        <ShareIcon className="h-[13px]" />
        {isClosed ? closedButtonText : buttonText}
      </Button>

      <ApplyModal
        post={post}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
}

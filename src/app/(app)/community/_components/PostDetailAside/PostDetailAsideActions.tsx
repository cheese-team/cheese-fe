'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';

import ApplyModal from '../ApplyModal';

import LikeOutlineIcon from '@/assets/icons/common/like-outline.svg';
import LikeFilledIcon from '@/assets/icons/common/like-filled.svg';
import ShareIcon from '@/assets/icons/common/contact.svg';

import type {
  JobPost,
  JobPostDetail,
  GroupPost,
  GroupPostDetail,
} from '@/types/community/community';

type PostDetailAsideActionsProps = {
  post: JobPost | JobPostDetail | GroupPost | GroupPostDetail;
  isClosed?: boolean;
  buttonText?: string;
  onToggleLike?: () => void;
  isLikePending?: boolean;
  onApply?: () => Promise<void>;
  isApplyPending?: boolean;
};

export default function PostDetailAsideActions({
  post,
  isClosed,
  buttonText = '지원하기',
  onToggleLike,
  isLikePending = false,
  onApply,
  isApplyPending = false,
}: PostDetailAsideActionsProps) {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked);

  const closedButtonText = 'apply' in post ? '채용 마감' : '모집 마감';

  const handleToggleLike = () => {
    if (isLikePending) return;

    if (onToggleLike) {
      onToggleLike();
      return;
    }

    setIsLiked((prev) => !prev);
  };

  const displayedIsLiked = onToggleLike ? post.isLiked : isLiked;
  const isApplied = post.isApplied;

  const handleApplyClick = () => {
    if (isClosed || isApplyPending || isApplied) return;
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
        disabled={isLikePending}
        size={54}
        width={46}
        className="border-gray-400"
      >
        {displayedIsLiked ? (
          <LikeFilledIcon className="text-error-subtle w-[14px]" />
        ) : (
          <LikeOutlineIcon className="w-[14px] text-gray-500" />
        )}
      </Button>

      {onApply && (
        <Button
          disabled={isClosed || isApplyPending || isApplied}
          onClick={handleApplyClick}
          size={54}
          width={182}
          className="flex gap-3"
        >
          <ShareIcon className="h-[13px]" />
          {isApplied
            ? '지원 완료'
            : isClosed
              ? closedButtonText
              : isApplyPending
                ? '지원 중...'
                : buttonText}
        </Button>
      )}

      {onApply && (
        <ApplyModal
          post={post}
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onApply={onApply}
          isApplyPending={isApplyPending}
          isApplied={post.isApplied}
        />
      )}
    </div>
  );
}

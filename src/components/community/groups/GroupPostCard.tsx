'use client';

import Link from 'next/link';

import { Chip } from '@/components/common/Chip';
import ProfileImage from '@/components/common/ProfileImage';

import { cn } from '@/lib/cn';
import { formatDeadline, isRecruitClosed } from '@/lib/formatDeadline';

import LikeOutlineIcon from '@/assets/icons/common/like-outline.svg';
import LikeFilledIcon from '@/assets/icons/common/like-filled.svg';
import CommentIcon from '@/assets/icons/common/comment.svg';

import type { Field, GroupPost } from '@/types/community/community';
import type { TogglePostLikeParams } from '@/types/community/community';

type GroupPostCardProps = {
  post: GroupPost;
  onToggleLike: (variables: TogglePostLikeParams) => void;
};

const FIELD_ORDER: Field[] = ['FE', 'BE'];

function sortFields(fields: Field[]) {
  return FIELD_ORDER.filter((field) => fields.includes(field));
}

export default function GroupPostCard({ post, onToggleLike }: GroupPostCardProps) {
  const isClosed = isRecruitClosed(post.deadline);

  const sortedFields = sortFields(post.field);

  return (
    <article
      className={cn(
        'flex h-[236px] w-full flex-col gap-2 rounded-[9px] border border-gray-300 p-5',
        isClosed && 'opacity-50',
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {sortedFields.map((field) => (
              <Chip key={field} variant={field}>
                {field}
              </Chip>
            ))}
          </div>

          <span className="text-[12px] text-gray-600">{formatDeadline(post.deadline)}</span>
        </div>

        <Link href={`/community/groups/${post.id}`} className="w-fit">
          <h3 className="line-clamp-2 h-[60px] text-[14px] leading-[30px] font-bold">
            {post.title}
          </h3>
        </Link>
      </div>

      <div className="text-[14px] leading-7 text-gray-700">
        <div>모집인원: {post.recruitCount}명</div>
        <div>예상기간: {post.expectedPeriod}</div>
      </div>

      <div className="flex items-center justify-between text-[12px] leading-[26px] text-gray-600">
        <div className="flex items-center gap-[10.5px] pl-0.5">
          <ProfileImage src={post.author.profileImageUrl} size={24} />
          <div>{post.author.nickname} 님</div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike({
                postId: post.id,
                isLiked: post.isLiked,
              });
            }}
            className="flex items-center gap-1"
          >
            {post.isLiked ? (
              <LikeFilledIcon className="text-error-subtle w-[13px]" />
            ) : (
              <LikeOutlineIcon className="w-[13px] text-gray-500" />
            )}

            <span>{post.likeCount}</span>
          </button>

          <div className="flex items-center gap-1">
            <CommentIcon className="w-[15px] text-gray-500" />
            <span>{post.commentCount}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

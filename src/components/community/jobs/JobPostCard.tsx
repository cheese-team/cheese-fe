'use client';

import Link from 'next/link';

import JobApplyAction from '@/components/community/jobs/JobApplyAction';
import { formatDeadline, isRecruitClosed } from '@/lib/formatDeadline';

import LikeOutlineIcon from '@/assets/icons/common/like-outline.svg';
import LikeFilledIcon from '@/assets/icons/common/like-filled.svg';

import type { JobPost } from '@/types/community';
import { getOptionLabel } from '@/lib/getOptionLabel';
import { EDUCATION_OPTIONS, EMPLOYMENT_TYPE_OPTIONS } from '@/constants/profileOptions';
import { cn } from '@/lib/cn';

type JobPostCardProps = {
  post: JobPost;
  onDirectApply: () => void;
  onToggleLike: (postId: number) => void;
};

export default function JobPostCard({ post, onDirectApply, onToggleLike }: JobPostCardProps) {
  const isClosed = isRecruitClosed(post.deadline);

  const educationLabel = getOptionLabel(EDUCATION_OPTIONS, post.education);
  const employmentTypeLabel = getOptionLabel(EMPLOYMENT_TYPE_OPTIONS, post.employmentType);

  const jobConditions = [post.career, educationLabel, post.location, employmentTypeLabel];

  return (
    <article className="flex items-center justify-between border-b border-gray-300 px-5 py-8">
      <div className={cn('flex w-[150px] items-center gap-1', isClosed && 'opacity-50')}>
        <span className="w-fit max-w-[130px] leading-5 font-bold break-all">
          {post.companyName}
        </span>
      </div>

      <div className={cn('mx-7 flex flex-1 flex-col gap-2', isClosed && 'opacity-50')}>
        <Link href={`/community/jobs/${post.id}`} className="w-fit">
          <h3 className="leading-5 font-bold">{post.title}</h3>
        </Link>

        <div className="text-[14px] leading-[30px] font-medium text-gray-700">
          필요스킬: {post.skills.join(', ')}
        </div>

        <ul className="flex">
          {jobConditions.map((item, i) => (
            <li key={i} className="flex items-center">
              <span className="text-[12px] text-gray-600">{item}</span>
              {i !== jobConditions.length - 1 && <div className="mx-3 h-[10px] w-px bg-gray-300" />}
            </li>
          ))}
        </ul>

        <span className="text-[12px] leading-5 text-gray-700">{formatDeadline(post.deadline)}</span>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(post.id);
          }}
          className="flex h-10 w-[38px] items-center justify-center rounded-[10px] border border-gray-500"
        >
          {post.isLiked ? (
            <LikeFilledIcon className="text-error-subtle w-[14px]" />
          ) : (
            <LikeOutlineIcon className="w-[14px] text-gray-500" />
          )}
        </button>
        <JobApplyAction apply={post.apply} onDirectApply={onDirectApply} isClosed={isClosed} />
      </div>
    </article>
  );
}

'use client';

import Link from 'next/link';

import JobApplyAction from './JobApplyAction';

import { cn } from '@/lib/cn';
import { formatDeadline, isRecruitClosed } from '@/lib/formatDeadline';
import { getOptionLabel } from '@/lib/getOptionLabel';
import { toFieldSelectValue } from '@/lib/jobField';

import {
  CAREER_OPTIONS,
  EDUCATION_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  FIELD_OPTIONS,
} from '@/constants/profileOptions';

import LikeOutlineIcon from '@/assets/icons/common/like-outline.svg';
import LikeFilledIcon from '@/assets/icons/common/like-filled.svg';

import type { JobPost } from '@/types/community/community';
import type { TogglePostLikeParams } from '@/types/community/community';

type JobPostCardProps = {
  post: JobPost;
  onDirectApply: () => void;
  onToggleLike: (variables: TogglePostLikeParams) => void;
};

export default function JobPostCard({ post, onDirectApply, onToggleLike }: JobPostCardProps) {
  const isClosed = isRecruitClosed(post.deadline);

  const fieldLabel = getOptionLabel(FIELD_OPTIONS, toFieldSelectValue(post.field));
  const educationLabel = getOptionLabel(EDUCATION_OPTIONS, post.education);
  const careerLabel = getOptionLabel(CAREER_OPTIONS, post.career);
  const employmentTypeLabel = getOptionLabel(EMPLOYMENT_TYPE_OPTIONS, post.employmentType);

  const jobConditions = [
    fieldLabel,
    careerLabel,
    educationLabel,
    post.location,
    employmentTypeLabel,
  ];

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

        <ul className="flex">
          {jobConditions.map((item, i) => (
            <li key={i} className="flex items-center">
              <span className="text-[12px]">{item}</span>
              {i !== jobConditions.length - 1 && <div className="mx-3 h-[10px] w-px bg-gray-300" />}
            </li>
          ))}
        </ul>

        <span className="text-[12px] leading-5">{formatDeadline(post.deadline)}</span>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike({
              postId: post.id,
              isLiked: post.isLiked,
            });
          }}
          className="flex h-10 min-w-[69px] items-center justify-center gap-1 rounded-[10px] border border-gray-500 px-3"
        >
          {post.isLiked ? (
            <LikeFilledIcon className="text-error-subtle w-[14px]" />
          ) : (
            <LikeOutlineIcon className="w-[14px] text-gray-500" />
          )}

          <span className={cn('font-medium', post.isLiked ? 'text-error-subtle' : '')}>
            {post.likeCount}
          </span>
        </button>
        <JobApplyAction apply={post.apply} onDirectApply={onDirectApply} isClosed={isClosed} />
      </div>
    </article>
  );
}

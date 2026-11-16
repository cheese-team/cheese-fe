'use client';

import Link from 'next/link';

import { Button } from '@/components/common/Button';
import JobApplyAction from './JobApplyAction';

import { cn } from '@/lib/cn';
import { formatDeadline, isRecruitClosed } from '@/lib/formatDeadline';
import { getOptionLabel } from '@/lib/getOptionLabel';
import { toFieldSelectValue } from '@/lib/jobField';
import { formatLikeCount } from '@/lib/formatLikeCount';

import {
  CAREER_OPTIONS,
  EDUCATION_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  FIELD_OPTIONS,
} from '@/constants/profileOptions';

import LikeOutlineIcon from '@/assets/icons/common/like-outline.svg';
import LikeFilledIcon from '@/assets/icons/common/like-filled.svg';

import type { JobPost } from '@/types/community/community';
import type { ToggleJobPostLikeParams } from '@/types/community/community';

type JobPostCardProps = {
  post: Omit<JobPost, 'author'>;
  onDirectApply: () => void;
  onToggleLike: (variables: ToggleJobPostLikeParams) => void;
  isLikePending?: boolean;
  isApplyPending?: boolean;
};

export default function JobPostCard({
  post,
  onDirectApply,
  onToggleLike,
  isLikePending = false,
  isApplyPending = false,
}: JobPostCardProps) {
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
  ].filter((item): item is string => typeof item === 'string' && item.trim() !== '');

  return (
    <article className="flex items-center justify-between border-b border-gray-300 px-5 py-8">
      <div className={cn('flex w-[150px] shrink-0 items-center gap-1', isClosed && 'opacity-50')}>
        <span
          className="line-clamp-3 w-fit max-w-[130px] leading-5 font-bold break-words"
          title={post.companyName}
        >
          {post.companyName}
        </span>
      </div>

      <div
        className={cn('mx-7 flex min-w-[300px] flex-1 flex-col gap-2', isClosed && 'opacity-50')}
      >
        <Link href={`/community/jobs/${post.id}`} className="w-fit max-w-full">
          <h3 className="line-clamp-1 leading-5 font-bold" title={post.title}>
            {post.title}
          </h3>
        </Link>

        <ul className="flex flex-wrap gap-y-1">
          {jobConditions.map((item, i) => (
            <li key={i} className="flex items-center">
              <span className="text-[12px] break-keep">{item}</span>
              {i !== jobConditions.length - 1 && <div className="mx-3 h-[10px] w-px bg-gray-300" />}
            </li>
          ))}
        </ul>

        <span className="text-[12px] leading-5">{formatDeadline(post.deadline)}</span>
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        <Button
          variant="outlineGray"
          size={40}
          paddingX={12}
          width={100}
          type="button"
          disabled={isLikePending}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike({
              jobId: post.id,
              isLiked: post.isLiked,
            });
          }}
          className="gap-1"
        >
          {post.isLiked ? (
            <LikeFilledIcon className="text-error-subtle w-[14px]" />
          ) : (
            <LikeOutlineIcon className="w-[14px] text-gray-500" />
          )}

          <span className={cn('font-medium', post.isLiked ? 'text-error-subtle' : 'text-gray-600')}>
            {formatLikeCount(post.likeCount)}
          </span>
        </Button>

        <JobApplyAction
          apply={post.apply}
          onDirectApply={onDirectApply}
          isClosed={isClosed}
          isApplied={post.isApplied}
          isApplyPending={isApplyPending}
        />
      </div>
    </article>
  );
}

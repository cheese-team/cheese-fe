'use client';

import { notFound, useParams } from 'next/navigation';

import {
  PostDetailAside,
  PostDetailAsideActions,
  PostDetailAsideInfoItem,
  PostDetailAsideProfile,
} from '../../_components/PostDetailAside';
import { JobDetailHeader } from '../_components';
import CommunityListState from '../../_components/CommunityListState';

import { ApiError } from '@/api/client';
import { useJobPost } from '@/queries/community/useJobPost';
import { useApplyJobPost } from '@/queries/community/useApplyJobPost';
import { useToggleJobPostLike } from '@/queries/community/useToggleJobPostLike';

import { getOptionLabel } from '@/lib/getOptionLabel';
import { isRecruitClosed } from '@/lib/formatDeadline';
import { formatDate } from '@/lib/formatDate';
import { isHttpUrl } from '../_lib/isHttpUrl';

import { APPLY_LABEL } from '@/components/community/jobs/constants';
import {
  CAREER_OPTIONS,
  EDUCATION_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
} from '@/constants/profileOptions';

import { POST_CONTENT_CLASS } from '../../_constants/community';

import type { Field } from '@/types/community/community';

const FIELD_ORDER: Field[] = ['FE', 'BE'];

function formatField(fields: Field[]) {
  return FIELD_ORDER.filter((field) => fields.includes(field)).join(', ');
}

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { data: jobPost, error, isPending, refetch } = useJobPost(jobId);
  const { mutate: toggleJobPostLike, isPending: isLikePending } = useToggleJobPostLike();
  const { mutateAsync: applyJobPost, isPending: isApplyPending } = useApplyJobPost();

  if (error instanceof ApiError && error.status === 404) {
    notFound();
  }

  if (isPending) {
    return <CommunityListState type="loading" message="로딩 중..." />;
  }

  if (error || !jobPost) {
    return (
      <CommunityListState
        type="error"
        message="채용공고를 불러오지 못했습니다."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const applyUrl =
    jobPost.apply.type === 'homepage'
      ? jobPost.apply.url
      : jobPost.links?.find((link) => link.type === 'homepage')?.url;

  const isClosed = isRecruitClosed(jobPost.deadline);

  const jobInfoItems = [
    { label: '회사명', value: jobPost.companyName || '-' },
    { label: '모집 분야', value: formatField(jobPost.field) || '-' },
    { label: '근무 지역', value: jobPost.location || '-' },
    { label: '사용 기술', value: jobPost.skills.join(', ') || '-' },
    {
      label: '공고 URL',
      value:
        applyUrl && isHttpUrl(applyUrl) ? (
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all underline"
          >
            {applyUrl}
          </a>
        ) : (
          '-'
        ),
    },
    {
      label: '학력',
      value: getOptionLabel(EDUCATION_OPTIONS, jobPost.education) || '-',
    },
    {
      label: '경력',
      value: getOptionLabel(CAREER_OPTIONS, jobPost.career) || '-',
    },
    {
      label: '고용 형태',
      value: getOptionLabel(EMPLOYMENT_TYPE_OPTIONS, jobPost.employmentType) || '-',
    },
    {
      label: '지원 마감일',
      value: jobPost.deadline ? formatDate(jobPost.deadline) : '상시모집',
    },
    { label: '지원 방법', value: APPLY_LABEL[jobPost.apply.type] },
  ];

  return (
    <div className="mb-[50px] flex items-start gap-5">
      <section className="flex flex-1 flex-col gap-10 px-5">
        <JobDetailHeader jobId={jobId} jobPost={jobPost} />

        <article className="flex flex-col gap-5">
          <div
            className={POST_CONTENT_CLASS}
            dangerouslySetInnerHTML={{ __html: jobPost.content }}
          />
        </article>
      </section>

      <PostDetailAside
        profile={<PostDetailAsideProfile author={jobPost.author} />}
        actions={
          <div className="flex w-full flex-col gap-5 px-3 py-5">
            <PostDetailAsideInfoItem label="지원자수" value={`${jobPost.applicantCount}명`} />
            <PostDetailAsideActions
              post={jobPost}
              isClosed={isClosed}
              isLikePending={isLikePending}
              isApplyPending={isApplyPending}
              onApply={async () => {
                if (isApplyPending || jobPost.isApplied || isClosed) return;
                const response = await applyJobPost(jobId);
                if (!response.isApplied) {
                  throw new Error('지원이 완료되지 않았습니다. 다시 시도해주세요.');
                }
              }}
              onToggleLike={() => {
                toggleJobPostLike({ jobId, isLiked: jobPost.isLiked });
              }}
            />
          </div>
        }
      >
        <div className="flex w-full flex-col gap-2 border-y border-gray-300 px-3 py-10">
          {jobInfoItems.map((item) => (
            <PostDetailAsideInfoItem key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </PostDetailAside>
    </div>
  );
}

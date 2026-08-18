import { notFound } from 'next/navigation';

import {
  PostDetailAside,
  PostDetailAsideActions,
  PostDetailAsideInfoItem,
  PostDetailAsideProfile,
} from '../../_components/PostDetailAside';
import { JobDetailHeader } from '../_components';

import { getOptionLabel } from '@/lib/getOptionLabel';
import { isRecruitClosed } from '@/lib/formatDeadline';

import { APPLY_LABEL } from '@/components/community/jobs/constants';
import { EDUCATION_OPTIONS, EMPLOYMENT_TYPE_OPTIONS } from '@/constants/profileOptions';

import { POST_CONTENT_CLASS } from '../../_constants/community';

import type { Field } from '@/types/community/community';

import { jobPosts } from '@/mocks/posts';

const FIELD_ORDER: Field[] = ['FE', 'BE'];

function formatField(fields: Field[]) {
  return FIELD_ORDER.filter((field) => fields.includes(field)).join(', ');
}

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;

  const jobPost = jobPosts.find((post) => post.id === Number(jobId));

  if (!jobPost) {
    notFound();
  }

  const applyUrl = jobPost.apply.type === 'homepage' ? jobPost.apply.url : '-';

  const isClosed = isRecruitClosed(jobPost.deadline);

  const jobInfoItems = [
    { label: '모집 분야', value: formatField(jobPost.field) },
    { label: '근무 지역', value: jobPost.location },
    { label: '사용 기술', value: jobPost.skills.join(', ') },
    {
      label: '공고 URL',
      value:
        jobPost.apply.type === 'homepage' ? (
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
    { label: '학력', value: getOptionLabel(EDUCATION_OPTIONS, jobPost.education) },
    { label: '고용 형태', value: getOptionLabel(EMPLOYMENT_TYPE_OPTIONS, jobPost.employmentType) },
    { label: '지원 마감일', value: jobPost.deadline },
    { label: '지원 방법', value: APPLY_LABEL[jobPost.apply.type] },
  ];

  return (
    <div className="mb-[50px] flex items-start gap-5">
      <section className="flex flex-1 flex-col gap-10 px-5">
        <JobDetailHeader jobPost={jobPost} />

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
            <PostDetailAsideActions post={jobPost} isClosed={isClosed} />
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

import { notFound } from 'next/navigation';

import Comment from '../../_components/Comment';
import {
  PostDetailAside,
  PostDetailAsideActions,
  PostDetailAsideInfoItem,
  PostDetailAsideProfile,
} from '../../_components/PostDetailAside';
import GroupDetailHeader from '../_components/GroupDetailHeader';

import { groupPosts } from '@/mocks/posts';
import { getOptionLabel } from '@/lib/getOptionLabel';
import { isRecruitClosed } from '@/lib/formatDeadline';

import { WORK_METHOD_OPTIONS } from '@/constants/profileOptions';
import { POST_CONTENT_CLASS } from '@/app/(app)/community/_constants/community';

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const groupPost = groupPosts.find((post) => post.id === Number(groupId));

  if (!groupPost) {
    notFound();
  }

  const isClosed = isRecruitClosed(groupPost.deadline);

  const groupInfoItems = [
    { label: '모집 분야', value: groupPost.field },
    {
      label: '진행방식',
      value: getOptionLabel(WORK_METHOD_OPTIONS, groupPost.progressType),
    },
    { label: '사용기술', value: groupPost.skills.join(', ') },
    { label: '예상기간', value: groupPost.expectedPeriod },
    { label: '모집인원', value: `${groupPost.recruitCount}명` },
    { label: '지원 마감일', value: groupPost.deadline ?? '상시모집' },
    { label: '지원 방법', value: groupPost.applyMethod },
  ];

  return (
    <div className="mb-[50px] flex items-start gap-5">
      <section className="flex flex-1 flex-col gap-10 px-5">
        <GroupDetailHeader groupPost={groupPost} />

        <article className="flex flex-col gap-5">
          {groupPost.imageUrl && (
            <img src={groupPost.imageUrl} alt={groupPost.title} className="max-w-[740px]" />
          )}

          <div
            className={POST_CONTENT_CLASS}
            dangerouslySetInnerHTML={{ __html: groupPost.content }}
          />
        </article>

        <Comment />
      </section>

      <PostDetailAside
        profile={<PostDetailAsideProfile author={groupPost.author} />}
        actions={
          <div className="flex w-full flex-col gap-5 px-3 py-5">
            <PostDetailAsideInfoItem label="지원자수" value={`${groupPost.applicantCount}명`} />
            <PostDetailAsideActions post={groupPost} isClosed={isClosed} />
          </div>
        }
      >
        <div className="flex w-full flex-col gap-2 border-y border-gray-300 px-3 py-10">
          {groupInfoItems.map((item) => (
            <PostDetailAsideInfoItem key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </PostDetailAside>
    </div>
  );
}

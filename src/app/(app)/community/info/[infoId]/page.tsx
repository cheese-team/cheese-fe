'use client';

import { notFound, useParams } from 'next/navigation';

import { PostDetailAside, PostDetailAsideProfile } from '../../_components/PostDetailAside';
import Comment from '../../_components/Comment';
import { InfoDetailHeader } from '../_components';

import { POST_CONTENT_CLASS } from '../../_constants/community';

import DownloadIcon from '@/assets/icons/common/download.svg';

import { ApiError } from '@/api/client';
import { useInfoPost } from '@/queries/community/useInfoPost';
import CommunityListState from '../../_components/CommunityListState';

export default function InfoDetailPage() {
  const { infoId } = useParams<{ infoId: string }>();
  const { data: infoPost, error, isPending, refetch } = useInfoPost(infoId);

  if (error instanceof ApiError && error.status === 404) {
    notFound();
  }

  if (isPending) {
    return <CommunityListState type="loading" message="로딩 중..." />;
  }

  if (error || !infoPost) {
    return (
      <CommunityListState
        type="error"
        message="정보/자료공유 게시글을 불러오지 못했습니다."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="mb-[50px] flex items-start gap-5">
      <section className="flex flex-1 flex-col gap-10 px-5">
        <InfoDetailHeader infoPost={infoPost} />

        <article className="flex flex-col gap-6">
          <div
            className={POST_CONTENT_CLASS}
            dangerouslySetInnerHTML={{ __html: infoPost.content }}
          />

          {infoPost.tags.length > 0 && (
            <ul
              aria-label="게시글 태그"
              className="text-success flex flex-wrap gap-x-2 gap-y-1 text-[17px]"
            >
              {infoPost.tags.map((tag) => (
                <li key={tag}>#{tag}</li>
              ))}
            </ul>
          )}
        </article>

        <Comment />
      </section>

      <PostDetailAside profile={<PostDetailAsideProfile author={infoPost.author} />}>
        {infoPost.attachmentUrl && (
          <div className="flex w-full flex-col gap-1 border-t border-gray-300 px-3 py-10 text-[14px] leading-6 text-gray-600">
            <div className="font-medium">첨부파일</div>
            <div className="flex items-start gap-1">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                <DownloadIcon className="w-3" />
              </div>
              <a
                href={infoPost.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-gray-950 underline"
              >
                {infoPost.attachmentFileName}
              </a>
            </div>
          </div>
        )}
      </PostDetailAside>
    </div>
  );
}

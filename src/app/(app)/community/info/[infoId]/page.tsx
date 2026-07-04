import { notFound } from 'next/navigation';

import { PostDetailAside, PostDetailAsideProfile } from '../../_components/PostDetailAside';
import Comment from '../../_components/Comment';
import InfoDetailHeader from '../_components/InfoDetailHeader';

import DownloadIcon from '@/assets/icons/common/download.svg';

import { POST_CONTENT_CLASS } from '../../_constants/community';

import { infoPosts } from '@/mocks/posts';

export default async function InfoDetailPage({ params }: { params: Promise<{ infoId: string }> }) {
  const { infoId } = await params;

  const infoPost = infoPosts.find((post) => post.id === Number(infoId));

  if (!infoPost) {
    notFound();
  }
  return (
    <div className="mb-[50px] flex items-start gap-5">
      <section className="flex flex-1 flex-col gap-10 px-5">
        <InfoDetailHeader infoPost={infoPost} />

        <article className="flex flex-col gap-5">
          {infoPost.thumbnailUrl && (
            <img src={infoPost.thumbnailUrl} alt={infoPost.title} className="max-w-[740px]" />
          )}

          <div
            className={POST_CONTENT_CLASS}
            dangerouslySetInnerHTML={{ __html: infoPost.content }}
          />
        </article>

        <Comment />
      </section>

      <PostDetailAside profile={<PostDetailAsideProfile author={infoPost.author} />}>
        {infoPost.attachmentUrl ? (
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
        ) : (
          ''
        )}
      </PostDetailAside>
    </div>
  );
}

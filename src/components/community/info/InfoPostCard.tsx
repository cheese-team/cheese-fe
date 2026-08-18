import Link from 'next/link';
import Image from 'next/image';

import { cn } from '@/lib/cn';
import { getOptionLabel } from '@/lib/getOptionLabel';

import { INFO_SORT_OPTIONS, POST_CONTENT_CLASS } from '@/app/(app)/community/_constants/community';

import ViewIcon from '@/assets/icons/common/view.svg';
import LikeOutlineIcon from '@/assets/icons/common/like-outline.svg';
import LikeFilledIcon from '@/assets/icons/common/like-filled.svg';
import CommentIcon from '@/assets/icons/common/comment.svg';

import type { InfoPost } from '@/types/community/community';
import type { TogglePostLikeParams } from '@/types/community/community';

type InfoPostCardProps = {
  post: InfoPost;
  wrapperClassName?: string;
  onToggleLike: (variables: TogglePostLikeParams) => void;
};

export default function InfoPostCard({ post, wrapperClassName, onToggleLike }: InfoPostCardProps) {
  return (
    <article className={cn('border-b border-gray-300 p-5 leading-5', wrapperClassName)}>
      <div className="flex w-full items-center gap-5">
        {post.thumbnailUrl ? (
          <Link href={`/community/info/${post.id}`}>
            <Image
              className="h-24 w-24 shrink-0 rounded-[10px] border border-gray-300 object-cover"
              width={96}
              height={96}
              src={post.thumbnailUrl}
              alt="게시글 썸네일 이미지"
            />
          </Link>
        ) : (
          ''
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Link href={`/community/info/${post.id}`} className="flex min-w-0 flex-col gap-3">
            <div className="flex min-w-0 gap-[5px] font-medium">
              <span className="shrink-0 text-gray-500">
                [{getOptionLabel(INFO_SORT_OPTIONS, post.category)}]
              </span>
              <h3 className="truncate">{post.title}</h3>
            </div>
            <p
              className={cn(
                POST_CONTENT_CLASS,
                'line-clamp-2 h-10 text-[14px] leading-5 font-medium text-gray-700',
              )}
            >
              {post.previewText}
            </p>
          </Link>

          <div className="flex justify-between gap-4 text-[12px] text-gray-600">
            <div className="min-w-0 truncate">{post.tags.map((tag) => `#${tag}`).join(' ')}</div>

            <div className="flex shrink-0 gap-2">
              <div className="flex items-center gap-1">
                <ViewIcon className="w-4 text-gray-500" />
                <span>{post.viewCount}</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  onToggleLike({
                    postId: post.id,
                    isLiked: post.isLiked,
                  })
                }
                className="flex items-center gap-1"
              >
                {post.isLiked ? (
                  <LikeFilledIcon className="text-error-subtle w-[14px]" />
                ) : (
                  <LikeOutlineIcon className="w-[14px] text-gray-500" />
                )}
                <span>{post.likeCount}</span>
              </button>

              <div className="flex items-center gap-1">
                <CommentIcon className="w-4 text-gray-500" />
                <span>{post.commentCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

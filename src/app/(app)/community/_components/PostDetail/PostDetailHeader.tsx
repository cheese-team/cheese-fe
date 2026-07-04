'use client';

import { useRouter } from 'next/navigation';

import { BackButton } from '@/components/common/BackButton';

import ViewIcon from '@/assets/icons/common/view.svg';
import MoreIcon from '@/assets/icons/common/more.svg';

import { getOptionLabel } from '@/lib/getOptionLabel';
import { INFO_SORT_OPTIONS } from '../../_constants/community';

type PostDetailHeaderProps = {
  category?: string;
  title: string;
  createdAt: string;
  viewCount: number;
  isMine?: boolean;
  isMenuOpen?: boolean;
  onToggleMenu?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function PostDetailHeader({
  category,
  title,
  createdAt,
  viewCount,
  isMine = false,
  isMenuOpen = false,
  onToggleMenu,
  onEdit,
  onDelete,
}: PostDetailHeaderProps) {
  const router = useRouter();

  return (
    <header className="relative flex flex-col gap-2 border-b border-gray-300 pt-8 pb-5">
      <div className="flex gap-2">
        <BackButton onClick={() => router.back()} />

        <h1 className="text-2xl leading-[30px] font-bold">
          {category && (
            <span className="mr-2 text-gray-500">
              [{getOptionLabel(INFO_SORT_OPTIONS, category)}]
            </span>
          )}
          {title}
        </h1>
      </div>

      <div className="flex items-center justify-end gap-5 text-gray-600">
        <span className="text-[14px] leading-6">{createdAt}</span>

        <div className="flex h-6 items-center gap-1">
          <ViewIcon className="w-4 text-gray-500" />
          <span className="text-[12px] leading-6 font-medium">{viewCount}</span>
        </div>

        <button
          type="button"
          aria-label="게시글 메뉴 열기"
          className="flex h-4 w-5 items-center justify-center"
          onClick={onToggleMenu}
        >
          <MoreIcon className="h-4" />
        </button>
      </div>

      {isMenuOpen && (
        <div className="bg-bg-white absolute top-25 right-2 z-10 flex w-25 flex-col gap-2 rounded-[10px] border border-gray-400 py-3 text-[12px] leading-5">
          {isMine ? (
            <>
              <button
                type="button"
                className="mx-3 rounded-[5px] px-2 text-left hover:bg-gray-200"
                onClick={onEdit}
              >
                수정
              </button>
              <button
                type="button"
                className="mx-3 rounded-[5px] px-2 text-left hover:bg-gray-200"
                onClick={onDelete}
              >
                삭제
              </button>
            </>
          ) : (
            <button type="button" className="mx-3 rounded-[5px] px-2 text-left hover:bg-gray-200">
              신고
            </button>
          )}
        </div>
      )}
    </header>
  );
}

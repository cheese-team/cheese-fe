'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { BackButton } from '@/components/common/BackButton';
import {
  dropdownContentStyle,
  dropdownOptionInteractiveStyle,
  dropdownOptionStyle,
} from '@/components/common/styles/dropdown';

import { cn } from '@/lib/cn';
import { getOptionLabel } from '@/lib/getOptionLabel';

import { INFO_SORT_OPTIONS } from '../../_constants/community';

import ViewIcon from '@/assets/icons/common/view.svg';
import MoreIcon from '@/assets/icons/common/more.svg';

type PostDetailHeaderProps = {
  category?: string;
  title: string;
  createdAt: string;
  viewCount: number;
  isMine?: boolean;
  isMenuOpen?: boolean;
  onToggleMenu?: () => void;
  onCloseMenu?: () => void;
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
  onCloseMenu,
  onEdit,
  onDelete,
}: PostDetailHeaderProps) {
  const router = useRouter();

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onCloseMenu?.();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseMenu?.();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen, onCloseMenu]);

  return (
    <header className="flex flex-col gap-2 border-b border-gray-300 pt-8 pb-5">
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

      <div className="flex items-center justify-end gap-5">
        <span className="text-[14px] leading-6 text-gray-600">{createdAt}</span>

        <div className="flex h-6 items-center gap-1">
          <ViewIcon className="w-4 text-gray-500" />
          <span className="text-[12px] leading-6 font-medium text-gray-600">{viewCount}</span>
        </div>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="게시글 메뉴 열기"
            className="flex h-4 w-5 items-center justify-center"
            onClick={onToggleMenu}
          >
            <MoreIcon className="h-4 text-gray-700" />
          </button>

          {isMenuOpen && (
            <div
              className={cn(
                dropdownContentStyle,
                'absolute top-6 right-3 z-10 flex w-25 flex-col gap-2',
              )}
            >
              {isMine ? (
                <>
                  <button
                    type="button"
                    className={cn(dropdownOptionStyle, dropdownOptionInteractiveStyle)}
                    onClick={onEdit}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className={cn(dropdownOptionStyle, dropdownOptionInteractiveStyle)}
                    onClick={onDelete}
                  >
                    삭제
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={cn(dropdownOptionStyle, dropdownOptionInteractiveStyle)}
                >
                  신고
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

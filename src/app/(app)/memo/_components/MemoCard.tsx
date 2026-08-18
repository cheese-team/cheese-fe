'use client';

import type { ReactNode } from 'react';

import Image from 'next/image';

import MemoCheckIcon from '@/assets/icons/memo/check.svg';
import MemoDeleteIcon from '@/assets/icons/memo/delete.svg';
import MemoDeletePermanentIcon from '@/assets/icons/memo/delete2.svg';
import EditIcon from '@/assets/icons/memo/edit.svg';
import MemoPinIcon from '@/assets/icons/memo/pin.svg';
import MemoPinFilledIcon from '@/assets/icons/memo/pin-filled.svg';
import MemoReturnIcon from '@/assets/icons/memo/return.svg';

import { getMemoTagColor } from '../_constants/memoColors';
import { stripHtml } from '../_lib/memoText';
import type { Memo } from '../_types/memo';
import { cn } from '@/lib/cn';

type MemoCardProps = {
  memo: Memo;
  onToggleSelect: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEdit: (memo: Memo) => void;
};

function MemoTitle({
  title,
  color,
  variant = 'text',
}: {
  title: string;
  color?: Memo['color'];
  variant?: 'text' | 'image';
}) {
  const tagColor = getMemoTagColor(color);

  return (
    <h3
      className={cn(
        'h-[24px] truncate rounded-[5px] px-[8px] text-[14px] leading-[24px] font-bold text-gray-950',
        variant === 'image' ? 'w-[208px]' : 'w-[178px]',
        tagColor?.bgClassName,
      )}
    >
      {title}
    </h3>
  );
}

function MemoThumbnail({ src }: { src: string }) {
  if (src.startsWith('data:')) {
    return (
      <div
        aria-hidden="true"
        className="h-full w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${src})`,
        }}
      />
    );
  }

  return <Image src={src} alt="" fill sizes="240px" className="object-cover" />;
}

function MemoCheckButton({ selected, onClick }: { selected?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="메모 선택"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        'absolute z-10 flex size-6 items-center justify-center',
        selected ? 'top-[14px] right-[14px]' : 'top-[15px] right-[15px]',
      )}
    >
      <MemoCheckIcon
        aria-hidden="true"
        className={cn('block size-6 shrink-0', selected ? 'text-secondary-700' : 'text-gray-300')}
      />
    </button>
  );
}

function MemoActionButton({
  children,
  label,
  pressed,
  onClick,
}: {
  children: ReactNode;
  label: string;
  pressed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="hover:text-secondary-700 flex size-6 items-center justify-center text-gray-500 transition-colors"
    >
      {children}
    </button>
  );
}

export function MemoCard({
  memo,
  onToggleSelect,
  onTogglePin,
  onDelete,
  onRestore,
  onPermanentDelete,
  onEdit,
}: MemoCardProps) {
  const hasImage = Boolean(memo.imageSrc);
  const isSelected = Boolean(memo.selected);
  const isPinned = Boolean(memo.pinned);
  const previewContent = stripHtml(memo.content);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!memo.deleted) {
          onEdit(memo);
        }
      }}
      onKeyDown={(event) => {
        if (memo.deleted) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;

        event.preventDefault();
        onEdit(memo);
      }}
      className={cn(
        'relative h-[258px] w-[240px] overflow-hidden rounded-[10px] border bg-white transition-colors',
        memo.deleted ? 'cursor-default' : 'cursor-pointer',
        isSelected && !memo.deleted ? 'border-secondary-600 border-2' : 'border-gray-300',
      )}
    >
      <MemoCheckButton selected={isSelected} onClick={() => onToggleSelect(memo.id)} />

      {hasImage ? (
        <div className="relative h-[170px] w-full overflow-hidden">
          <MemoThumbnail src={memo.imageSrc as string} />
        </div>
      ) : (
        <div className="h-[176px] px-[16px] pt-[16px]">
          <MemoTitle title={memo.title} color={memo.color} variant="text" />

          <p className="mt-2 [display:-webkit-box] overflow-hidden text-[12px] leading-[17px] font-medium tracking-[-0.02em] text-gray-600 [-webkit-box-orient:vertical] [-webkit-line-clamp:9]">
            {previewContent || '최대 9줄'}
          </p>
        </div>
      )}

      <div className={cn('px-[16px]', hasImage ? 'pt-[16px]' : 'pt-0')}>
        {hasImage ? (
          <div className="mb-[12px]">
            <MemoTitle title={memo.title} color={memo.color} variant="image" />
          </div>
        ) : null}

        <div
          className={cn(
            'absolute flex items-start justify-between',
            isSelected && !memo.deleted
              ? 'right-[14px] bottom-[14px] left-[14px]'
              : 'right-[15px] bottom-[15px] left-[15px]',
          )}
        >
          <span className="text-[12px] leading-6 tracking-[-0.02em] text-gray-500">
            {memo.createdAt}
            {memo.deleted ? ' 삭제됨' : ''}
          </span>

          <div className="flex items-center gap-[8px]">
            {memo.deleted ? (
              <>
                <MemoActionButton label="복구" onClick={() => onRestore(memo.id)}>
                  <MemoReturnIcon className="h-[18px] w-[18px] text-gray-500" aria-hidden="true" />
                </MemoActionButton>

                <MemoActionButton label="영구 삭제" onClick={() => onPermanentDelete(memo.id)}>
                  <MemoDeletePermanentIcon
                    className="h-[18px] w-[18px] text-gray-500"
                    aria-hidden="true"
                  />
                </MemoActionButton>
              </>
            ) : (
              <>
                <MemoActionButton
                  label="고정"
                  pressed={isPinned}
                  onClick={() => onTogglePin(memo.id)}
                >
                  {isPinned ? (
                    <MemoPinFilledIcon
                      className="h-[14.93px] w-[14.966px] shrink-0 text-gray-950"
                      aria-hidden="true"
                    />
                  ) : (
                    <MemoPinIcon
                      className="h-[14.93px] w-[14.966px] shrink-0 text-gray-500"
                      aria-hidden="true"
                    />
                  )}
                </MemoActionButton>

                <MemoActionButton label="수정" onClick={() => onEdit(memo)}>
                  <EditIcon className="size-6" aria-hidden="true" />
                </MemoActionButton>

                <MemoActionButton label="삭제" onClick={() => onDelete(memo.id)}>
                  <MemoDeleteIcon className="h-4 w-[13.6px] text-gray-500" aria-hidden="true" />
                </MemoActionButton>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

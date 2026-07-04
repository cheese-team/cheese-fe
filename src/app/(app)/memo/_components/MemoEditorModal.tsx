'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';

import ArrowIcon from '@/assets/icons/common/arrow.svg';
import CreateIcon from '@/assets/icons/common/create.svg';
import MemoDeleteIcon from '@/assets/icons/memo/delete.svg';
import MemoPictureIcon from '@/assets/icons/memo/picture.svg';
import MemoPinIcon from '@/assets/icons/memo/pin.svg';
import MemoPinFilledIcon from '@/assets/icons/memo/pin-filled.svg';
import { cn } from '@/lib/cn';

import { MemoRichEditor } from './MemoRichEditor';
import { getMemoTagColor, MEMO_COLOR_OPTIONS } from '../_constants/memoColors';
import type { Memo, MemoColor } from '../_types/memo';

type MemoEditorModalProps = {
  open: boolean;
  memo?: Memo | null;
  onClose: () => void;
  onSubmit: (
    memo: Omit<Memo, 'id' | 'createdAt'> & Partial<Pick<Memo, 'id' | 'createdAt'>>,
  ) => void;
};

type MemoEditorModalContentProps = {
  memo?: Memo | null;
  onClose: () => void;
  onSubmit: MemoEditorModalProps['onSubmit'];
};

const NO_PICTURE_IMAGE_SRC = '/images/nopicture.png';

const COLOR_SWATCH_SIZE = 20;
const COLOR_SWATCH_GAP = 8;

function PhotoPlaceholder() {
  return (
    <div className="relative h-[260px] w-[450px] overflow-hidden bg-gray-100">
      <Image
        src={NO_PICTURE_IMAGE_SRC}
        alt="No photo"
        fill
        priority={false}
        sizes="450px"
        className="object-cover"
      />
    </div>
  );
}

function MemoImagePreview({ src }: { src: string }) {
  return (
    <div
      aria-hidden="true"
      className="h-[260px] w-[450px] bg-gray-100 bg-cover bg-center"
      style={{
        backgroundImage: `url(${src})`,
      }}
    />
  );
}

function MemoColorPicker({
  value,
  onChange,
}: {
  value?: MemoColor;
  onChange: (color: MemoColor) => void;
}) {
  const [open, setOpen] = useState(!value);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const isCollapsed = Boolean(value) && !open;
  const visibleColors = isCollapsed
    ? MEMO_COLOR_OPTIONS.filter((option) => option.color === value)
    : MEMO_COLOR_OPTIONS;

  const paletteWidth =
    visibleColors.length * COLOR_SWATCH_SIZE +
    Math.max(visibleColors.length - 1, 0) * COLOR_SWATCH_GAP;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (!pickerRef.current) return;
      if (pickerRef.current.contains(event.target as Node)) return;

      if (value) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open, value]);

  return (
    <div ref={pickerRef} className="flex items-center">
      <div
        className="overflow-hidden"
        style={{
          width: `${paletteWidth}px`,
          transition: 'width 240ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="flex items-center gap-[8px]">
          {visibleColors.map((option) => {
            const tagColor = getMemoTagColor(option.color);
            const selected = value === option.color;

            return (
              <button
                key={option.color}
                type="button"
                aria-label={`${option.label} 색상 선택`}
                aria-pressed={selected}
                onClick={() => {
                  if (selected) {
                    setOpen((prev) => !prev);
                    return;
                  }

                  onChange(option.color);
                  setOpen(false);
                }}
                className={cn(
                  'h-[20px] w-[20px] shrink-0 rounded-[5px] border border-transparent transition-transform duration-150 hover:scale-105 hover:border-gray-300',
                  tagColor?.chipClassName,
                  selected && 'border-gray-300',
                )}
                style={{
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.52)',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function removeContentImages(html: string) {
  return html.replace(/<img\b[^>]*>/gi, '').trim();
}

function MemoEditorModalContent({ memo, onClose, onSubmit }: MemoEditorModalContentProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState(memo?.title ?? '');
  const [content, setContent] = useState(removeContentImages(memo?.content ?? ''));
  const [color, setColor] = useState<MemoColor | undefined>(memo?.color);
  const [pinned, setPinned] = useState(Boolean(memo?.pinned));
  const [imageSrc, setImageSrc] = useState(memo?.imageSrc ?? '');

  const handleBackdropMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;

    onClose();
  };

  const openImagePicker = () => {
    imageInputRef.current?.click();
  };

  const handleUploadImage = (file?: File) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setImageSrc(String(reader.result));
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageSrc('');
  };

  const handleSubmit = () => {
    onSubmit({
      id: memo?.id,
      createdAt: memo?.createdAt,
      title: title.trim() || '제목',
      content: removeContentImages(content),
      color,
      pinned,
      imageSrc: imageSrc || undefined,
      selected: memo?.selected,
      deleted: memo?.deleted,
    });

    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-start justify-center bg-transparent pt-[150px]"
      onMouseDown={handleBackdropMouseDown}
    >
      <section className="flex h-[780px] w-[990px] flex-col overflow-hidden rounded-[8px] border border-gray-300 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <header className="flex h-[66px] shrink-0 items-center justify-between border-b border-gray-300 bg-gray-100 px-[32px]">
          <div className="flex items-center gap-[16px]">
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex h-[28px] w-[28px] items-center justify-center text-gray-700"
            >
              <ArrowIcon className="h-[24px] w-[14px]" aria-hidden="true" />
            </button>

            <h2 className="text-[20px] leading-[30px] font-medium text-gray-950">메모</h2>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="bg-secondary-700 flex h-[44px] w-[104px] items-center justify-center gap-[8px] rounded-[10px] text-[14px] font-medium text-white"
          >
            <CreateIcon className="h-[16px] w-[16px]" aria-hidden="true" />
            {memo ? '수정하기' : '생성하기'}
          </button>
        </header>

        <div className="flex h-[54px] shrink-0 items-center justify-between border-b border-gray-300 px-[32px]">
          <div className="flex items-center gap-[10px]">
            <span className="text-[12px] leading-[18px] font-medium text-gray-500">
              메모 색상 설정
            </span>

            <MemoColorPicker value={color} onChange={setColor} />
          </div>

          <div className="flex items-center gap-[22px] text-gray-600">
            <button
              type="button"
              aria-label="고정"
              onClick={() => setPinned((prev) => !prev)}
              className="flex h-[20px] w-[20px] items-center justify-center"
            >
              {pinned ? (
                <MemoPinFilledIcon className="h-[20px] w-[20px] text-gray-950" aria-hidden="true" />
              ) : (
                <MemoPinIcon className="h-[20px] w-[20px] text-gray-600" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              aria-label="대표 이미지 추가"
              onClick={openImagePicker}
              className="text-gray-600"
            >
              <MemoPictureIcon className="h-[20px] w-[20px]" aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label="대표 이미지 삭제"
              onClick={handleRemoveImage}
              disabled={!imageSrc}
              className="text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <MemoDeleteIcon className="h-[20px] w-[20px]" aria-hidden="true" />
            </button>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                handleUploadImage(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </div>
        </div>

        <MemoRichEditor value={content} onChange={setContent}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목"
            className="mb-[38px] h-[34px] w-full bg-transparent text-[24px] leading-[34px] font-bold text-gray-950 outline-none placeholder:text-gray-500"
          />

          {imageSrc ? <MemoImagePreview src={imageSrc} /> : <PhotoPlaceholder />}
        </MemoRichEditor>
      </section>
    </div>
  );
}

export function MemoEditorModal({ open, memo, onClose, onSubmit }: MemoEditorModalProps) {
  if (!open) return null;

  return (
    <MemoEditorModalContent
      key={memo?.id ?? 'create'}
      memo={memo}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

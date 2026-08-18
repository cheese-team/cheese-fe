'use client';

import Image from 'next/image';
import { useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';

import ArrowIcon from '@/assets/icons/common/arrow.svg';
import CreateIcon from '@/assets/icons/common/create.svg';
import MemoDeleteIcon from '@/assets/icons/memo/delete.svg';
import MemoPictureIcon from '@/assets/icons/memo/picture.svg';
import MemoPinIcon from '@/assets/icons/memo/pin.svg';
import MemoPinFilledIcon from '@/assets/icons/memo/pin-filled.svg';
import { CollapsibleColorPicker } from '@/components/common/CollapsibleColorPicker';

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
  onDelete: (id: string) => void;
};

type MemoEditorModalContentProps = {
  memo?: Memo | null;
  onClose: () => void;
  onSubmit: MemoEditorModalProps['onSubmit'];
  onDelete: MemoEditorModalProps['onDelete'];
};

const NO_PICTURE_IMAGE_SRC = '/images/nopicture.png';

const MEMO_COLOR_PICKER_OPTIONS = MEMO_COLOR_OPTIONS.map((option) => ({
  value: option.color,
  label: option.label,
  swatchClassName: getMemoTagColor(option.color)?.chipClassName,
}));

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

function removeContentImages(html: string) {
  return html.replace(/<img\b[^>]*>/gi, '').trim();
}

function MemoEditorModalContent({
  memo,
  onClose,
  onSubmit,
  onDelete,
}: MemoEditorModalContentProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState(memo?.title ?? '');
  const [content, setContent] = useState(removeContentImages(memo?.content ?? ''));
  const [color, setColor] = useState<MemoColor | undefined>(memo?.color);
  const [pinned, setPinned] = useState(Boolean(memo?.pinned));
  const [imageSrc, setImageSrc] = useState(memo?.imageSrc ?? '');
  const [isDeleteWarningVisible, setIsDeleteWarningVisible] = useState(false);

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

  const handleConfirmDelete = () => {
    if (!memo?.id) return;

    onDelete(memo.id);
    onClose();
  };

  const handleDeleteClick = () => {
    if (!memo?.id) return;

    if (isDeleteWarningVisible) {
      handleConfirmDelete();
      return;
    }

    setIsDeleteWarningVisible(true);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-start justify-center bg-transparent pt-[150px]"
      onMouseDown={handleBackdropMouseDown}
    >
      <section className="flex h-[780px] w-[990px] flex-col overflow-hidden rounded-[8px] border border-gray-300 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-gray-300 bg-gray-100 px-[24px]">
          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex h-[30px] w-[30px] items-center justify-center text-gray-700"
            >
              <ArrowIcon className="h-[16px] w-[9px]" aria-hidden="true" />
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

        <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-gray-300 px-[32px]">
          <div className="flex items-center gap-[6px]">
            <span className="text-[12px] leading-[18px] font-medium text-gray-600">
              메모 색상 설정
            </span>

            <CollapsibleColorPicker
              value={color}
              options={MEMO_COLOR_PICKER_OPTIONS}
              onChange={setColor}
            />
          </div>

          <div className="flex items-center gap-[16px] text-gray-600">
            <button
              type="button"
              aria-label="고정"
              onClick={() => setPinned((prev) => !prev)}
              className="flex h-[24px] w-[24px] items-center justify-center"
            >
              {pinned ? (
                <MemoPinFilledIcon
                  className="block h-[18px] w-[18px] shrink-0 text-gray-950"
                  aria-hidden="true"
                />
              ) : (
                <MemoPinIcon
                  className="block h-[18px] w-[18px] shrink-0 text-gray-600"
                  aria-hidden="true"
                />
              )}
            </button>

            <button
              type="button"
              aria-label="대표 이미지 추가"
              onClick={openImagePicker}
              className="flex h-[24px] w-[24px] items-center justify-center text-gray-600"
            >
              <MemoPictureIcon
                className="block h-[18px] w-[18px] shrink-0 -translate-y-px"
                aria-hidden="true"
              />
            </button>

            {memo?.id ? (
              <button
                type="button"
                aria-label="메모 삭제"
                onClick={handleDeleteClick}
                className="flex h-[24px] w-[24px] items-center justify-center text-gray-600"
              >
                <MemoDeleteIcon className="block h-[18px] w-[16px] shrink-0" aria-hidden="true" />
              </button>
            ) : null}

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

      {isDeleteWarningVisible ? (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-tag-red-100 text-error pointer-events-none absolute top-[20px] left-1/2 z-[60] flex min-h-[44px] -translate-x-1/2 items-center rounded-[8px] px-[18px] py-[10px] text-[14px] leading-[20px] font-medium whitespace-nowrap shadow-[0_6px_20px_rgba(15,23,42,0.14)]"
        >
          메모를 삭제하시겠습니까? 삭제 버튼을 한 번 더 눌러주세요.
        </div>
      ) : null}
    </div>
  );
}

export function MemoEditorModal({ open, memo, onClose, onSubmit, onDelete }: MemoEditorModalProps) {
  if (!open) return null;

  return (
    <MemoEditorModalContent
      key={memo?.id ?? 'create'}
      memo={memo}
      onClose={onClose}
      onSubmit={onSubmit}
      onDelete={onDelete}
    />
  );
}

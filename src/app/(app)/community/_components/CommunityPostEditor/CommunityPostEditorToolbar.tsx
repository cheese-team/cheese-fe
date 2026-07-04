'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import type { Editor } from '@tiptap/react';

import { cn } from '@/lib/cn';

import LinkIcon from '@/assets/icons/common/link.svg';
import {
  AddImageIcon,
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  DropdownArrowIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikeIcon,
  TextUnderlineIcon,
} from '@/assets/icons/editor';

type ToolbarButtonProps = {
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: ReactNode;
  onClick: () => void;
};

const TEXT_COLORS = [
  { label: '검정', hex: '#111111' },
  { label: '회색', hex: '#6B7280' },
  { label: '빨강', hex: '#EB5B49' },
  { label: '노랑', hex: '#F4C340' },
  { label: '초록', hex: '#9CC04B' },
  { label: '파랑', hex: '#5B9EF7' },
  { label: '보라', hex: '#9B59D0' },
];

function ToolbarButton({ active, disabled, label, children, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-[4px] transition-colors',
        active
          ? 'bg-gray-200 text-gray-950'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      {children}
    </button>
  );
}

function TextColorDropdown({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedColor =
    (editor?.getAttributes('textStyle').color as string | undefined) ?? TEXT_COLORS[0].hex;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;

      setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="텍스트 색상 선택"
        aria-expanded={open}
        disabled={!editor}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-6 w-13 items-center justify-center gap-[14px] rounded-[4px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span
          className="h-[18px] w-[18px] rounded-[3px] border-2 border-gray-400"
          style={{ backgroundColor: selectedColor }}
          aria-hidden="true"
        />
        <DropdownArrowIcon className="w-[10px]" aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute top-[36px] left-0 z-50 grid w-[116px] grid-cols-4 gap-[6px] rounded-[8px] border border-gray-300 bg-white p-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          {TEXT_COLORS.map((option) => {
            const selected = selectedColor.toLowerCase() === option.hex.toLowerCase();

            return (
              <button
                key={option.hex}
                type="button"
                aria-label={`${option.label} 색상`}
                title={option.label}
                onClick={() => {
                  editor?.chain().focus().setColor(option.hex).run();
                  setOpen(false);
                }}
                className={cn(
                  'flex h-[20px] w-[20px] items-center justify-center rounded-[5px] border transition-transform hover:scale-105',
                  selected ? 'border-gray-950' : 'border-gray-300',
                )}
              >
                <span
                  className="h-[14px] w-[14px] rounded-[3px]"
                  style={{ backgroundColor: option.hex }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function CommunityPostEditorToolbar({
  editor,
  onAddImage,
}: {
  editor: Editor | null;
  onAddImage: () => void;
}) {
  const disabled = !editor;

  const handleSetLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('링크를 입력해주세요.', previousUrl ?? '');

    if (url === null) return;

    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  return (
    <div className="flex h-[54px] shrink-0 items-center gap-5 border-b border-gray-300 p-4">
      <div className="flex shrink-0 items-center gap-3">
        <ToolbarButton
          label="굵게"
          disabled={disabled}
          active={editor?.isActive('bold')}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <TextBoldIcon className="h-4" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarButton
          label="기울임"
          disabled={disabled}
          active={editor?.isActive('italic')}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <TextItalicIcon className="h-4" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarButton
          label="밑줄"
          disabled={disabled}
          active={editor?.isActive('underline')}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <TextUnderlineIcon className="h-4" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarButton
          label="취소선"
          disabled={disabled}
          active={editor?.isActive('strike')}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        >
          <TextStrikeIcon className="h-4" aria-hidden="true" />
        </ToolbarButton>

        <TextColorDropdown editor={editor} />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <ToolbarButton
          label="링크 첨부"
          disabled={disabled}
          active={editor?.isActive('link')}
          onClick={handleSetLink}
        >
          <LinkIcon className="w-5" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarButton label="이미지 첨부" disabled={disabled} onClick={onAddImage}>
          <AddImageIcon className="h-4" aria-hidden="true" />
        </ToolbarButton>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <ToolbarButton
          label="왼쪽 정렬"
          disabled={disabled}
          active={editor?.isActive({ textAlign: 'left' })}
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeftIcon className="h-[17px]" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarButton
          label="가운데 정렬"
          disabled={disabled}
          active={editor?.isActive({ textAlign: 'center' })}
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenterIcon className="h-[17px]" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarButton
          label="오른쪽 정렬"
          disabled={disabled}
          active={editor?.isActive({ textAlign: 'right' })}
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
        >
          <AlignRightIcon className="h-[17px]" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarButton
          label="양쪽 정렬"
          disabled={disabled}
          active={editor?.isActive({ textAlign: 'justify' })}
          onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
        >
          <AlignJustifyIcon className="h-[17px]" aria-hidden="true" />
        </ToolbarButton>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import Link from '@tiptap/extension-link';
import { cn } from '@/lib/cn';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import LinkIcon from '@/assets/icons/common/link.svg';

type MemoRichEditorProps = {
  value: string;
  onChange: (value: string) => void;
  children?: ReactNode;
};

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
        'flex h-[32px] min-w-[32px] items-center justify-center rounded-[4px] px-[6px] text-[18px] leading-none font-medium transition-colors',
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

function DropdownArrowIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className="h-[12px] w-[12px]">
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
        className="flex h-[32px] w-[48px] items-center justify-center gap-[6px] rounded-[4px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span
          className="h-[14px] w-[14px] rounded-[3px] border border-gray-300"
          style={{ backgroundColor: selectedColor }}
          aria-hidden="true"
        />

        <DropdownArrowIcon />
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

function AlignLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-[20px] w-[20px]">
      <path
        d="M4 5h12M4 9h8M4 13h12M4 17h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-[20px] w-[20px]">
      <path
        d="M4 5h12M6 9h8M4 13h12M6 17h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-[20px] w-[20px]">
      <path
        d="M4 5h12M8 9h8M4 13h12M8 17h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AlignJustifyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-[20px] w-[20px]">
      <path
        d="M4 5h12M4 9h12M4 13h12M4 17h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MemoEditorToolbar({ editor }: { editor: Editor | null }) {
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
    <div className="flex h-[54px] shrink-0 items-center gap-[8px] border-b border-gray-300 px-[32px]">
      <ToolbarButton
        label="굵게"
        disabled={disabled}
        active={editor?.isActive('bold')}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        B
      </ToolbarButton>

      <ToolbarButton
        label="기울임"
        disabled={disabled}
        active={editor?.isActive('italic')}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </ToolbarButton>

      <ToolbarButton
        label="밑줄"
        disabled={disabled}
        active={editor?.isActive('underline')}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
      >
        <span className="underline">U</span>
      </ToolbarButton>

      <ToolbarButton
        label="취소선"
        disabled={disabled}
        active={editor?.isActive('strike')}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
      >
        <span className="line-through">S</span>
      </ToolbarButton>

      <TextColorDropdown editor={editor} />

      <ToolbarButton
        label="링크"
        disabled={disabled}
        active={editor?.isActive('link')}
        onClick={handleSetLink}
      >
        <LinkIcon className="h-[18px] w-[18px]" aria-hidden="true" />
      </ToolbarButton>

      <ToolbarButton
        label="왼쪽 정렬"
        disabled={disabled}
        active={editor?.isActive({ textAlign: 'left' })}
        onClick={() => editor?.chain().focus().setTextAlign('left').run()}
      >
        <AlignLeftIcon />
      </ToolbarButton>

      <ToolbarButton
        label="가운데 정렬"
        disabled={disabled}
        active={editor?.isActive({ textAlign: 'center' })}
        onClick={() => editor?.chain().focus().setTextAlign('center').run()}
      >
        <AlignCenterIcon />
      </ToolbarButton>

      <ToolbarButton
        label="오른쪽 정렬"
        disabled={disabled}
        active={editor?.isActive({ textAlign: 'right' })}
        onClick={() => editor?.chain().focus().setTextAlign('right').run()}
      >
        <AlignRightIcon />
      </ToolbarButton>

      <ToolbarButton
        label="양쪽 정렬"
        disabled={disabled}
        active={editor?.isActive({ textAlign: 'justify' })}
        onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
      >
        <AlignJustifyIcon />
      </ToolbarButton>
    </div>
  );
}

export function MemoRichEditor({ value, onChange, children }: MemoRichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: '메모를 입력하세요',
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'memo-rich-editor min-h-[180px] w-full outline-none text-[16px] font-medium leading-[24px] text-gray-700',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === value) return;

    editor.commands.setContent(value || '', {
      emitUpdate: false,
    });
  }, [editor, value]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MemoEditorToolbar editor={editor} />

      <div className="min-h-0 flex-1 overflow-y-auto px-[64px] pt-[48px] pb-[48px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}

        <div className="mt-[28px]">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

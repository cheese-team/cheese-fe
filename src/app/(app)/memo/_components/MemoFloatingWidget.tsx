'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import ArrowIcon from '@/assets/icons/common/arrow.svg';
import EditIcon from '@/assets/icons/common/edit.svg';
import MemoDeleteIcon from '@/assets/icons/memo/delete.svg';
import MemoWidgetCloseIcon from '@/assets/icons/memo/memodelete.svg';
import MemoWidgetPlusIcon from '@/assets/icons/memo/memoplus.svg';
import MemoWidgetIcon from '@/assets/icons/memo/memowidget.svg';
import MemoPinIcon from '@/assets/icons/memo/pin.svg';
import MemoPinFilledIcon from '@/assets/icons/memo/pin-filled.svg';
import { cn } from '@/lib/cn';

import { stripHtml } from '../_lib/memoText';
import { useMemoStore, type MemoSavePayload } from '../_store/MemoStoreProvider';
import type { Memo, MemoColor } from '../_types/memo';

type ActiveMemoDraft = {
  mode: 'create' | 'edit';
  id?: string;
  createdAt?: string;
  title: string;
  content: string;
  color?: MemoColor;
  pinned: boolean;
  imageSrc?: string;
  selected?: boolean;
  deleted?: boolean;
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toMemoHtml(text: string) {
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  if (!normalizedText.trim()) return '';

  return normalizedText
    .split('\n')
    .map((line) => {
      if (!line.trim()) {
        return '<p><br /></p>';
      }

      return `<p>${escapeHtml(line)}</p>`;
    })
    .join('');
}

function createDraftFromMemo(memo: Memo): ActiveMemoDraft {
  return {
    mode: 'edit',
    id: memo.id,
    createdAt: memo.createdAt,
    title: memo.title,
    content: stripHtml(memo.content),
    color: memo.color,
    pinned: Boolean(memo.pinned),
    imageSrc: memo.imageSrc,
    selected: memo.selected,
    deleted: memo.deleted,
  };
}

function MemoWidgetHeaderArrow() {
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex h-[14px] w-[8px] shrink-0 overflow-visible text-gray-500"
    >
      <span className="absolute top-1/2 left-1/2 flex h-[24px] w-[14px] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <ArrowIcon className="block h-[24px] w-[14px] origin-center scale-[0.583] rotate-180 text-gray-500" />
      </span>
    </span>
  );
}

function WidgetActionButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="flex h-[20px] w-[20px] items-center justify-center text-gray-500 transition-colors hover:text-gray-950"
    >
      {children}
    </button>
  );
}

function WidgetCircleButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="hover:border-secondary-700 hover:text-secondary-700 flex h-[70px] w-[70px] items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition-colors"
    >
      <span className="flex h-[16px] w-[16px] items-center justify-center [&>svg]:block [&>svg]:h-[16px] [&>svg]:w-[16px] [&>svg]:shrink-0">
        {children}
      </span>
    </button>
  );
}

function WidgetMemoEditorCard({
  draft,
  editorRef,
  onChangeDraft,
  onTogglePin,
  onDelete,
}: {
  draft: ActiveMemoDraft;
  editorRef: RefObject<HTMLDivElement | null>;
  onChangeDraft: (nextDraft: ActiveMemoDraft) => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      ref={editorRef}
      className="relative box-border h-[124px] w-full rounded-[10px] border border-gray-300 bg-white px-[16px] py-[14px]"
    >
      <input
        value={draft.title}
        onChange={(event) =>
          onChangeDraft({
            ...draft,
            title: event.target.value,
          })
        }
        placeholder="제목"
        autoFocus
        className="h-[22px] w-full bg-transparent text-[14px] leading-[20px] font-bold text-gray-950 outline-none placeholder:text-gray-500"
      />

      <textarea
        value={draft.content}
        onChange={(event) =>
          onChangeDraft({
            ...draft,
            content: event.target.value,
          })
        }
        placeholder="내용"
        className="mt-[10px] h-[42px] w-full resize-none bg-transparent pr-[74px] text-[14px] leading-[21px] font-medium text-gray-800 outline-none [scrollbar-width:none] placeholder:text-gray-500 [&::-webkit-scrollbar]:hidden"
      />

      <div className="absolute right-[16px] bottom-[14px] flex items-center justify-end gap-[12px]">
        <WidgetActionButton label="메모 고정" onClick={onTogglePin}>
          {draft.pinned ? (
            <MemoPinFilledIcon className="h-[16px] w-[16px] text-gray-950" aria-hidden="true" />
          ) : (
            <MemoPinIcon className="h-[16px] w-[16px]" aria-hidden="true" />
          )}
        </WidgetActionButton>

        <span className="flex h-[20px] w-[20px] items-center justify-center text-gray-500">
          <EditIcon className="h-[16px] w-[16px]" aria-hidden="true" />
        </span>

        <WidgetActionButton label="메모 삭제" onClick={onDelete}>
          <MemoDeleteIcon className="h-[16px] w-[16px]" aria-hidden="true" />
        </WidgetActionButton>
      </div>
    </article>
  );
}

function WidgetMemoCard({
  memo,
  expanded,
  onToggleExpand,
  onEdit,
  onTogglePin,
  onDelete,
}: {
  memo: Memo;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: (memo: Memo) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const previewContent = stripHtml(memo.content);

  return (
    <article className="box-border w-full rounded-[10px] border border-gray-300 bg-white px-[16px] py-[14px] transition-colors hover:bg-gray-100">
      <button type="button" onClick={onToggleExpand} className="block w-full text-left">
        <h3 className="truncate text-[14px] leading-[20px] font-bold text-gray-950">
          {memo.title}
        </h3>

        <p
          className={cn(
            'mt-[10px] text-[14px] leading-[22px] font-medium text-gray-800',
            expanded
              ? 'break-words whitespace-pre-line'
              : '[display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2]',
          )}
        >
          {previewContent || '내용'}
        </p>
      </button>

      <div className="mt-[14px] flex items-center justify-end gap-[12px]">
        <WidgetActionButton label="메모 고정" onClick={() => onTogglePin(memo.id)}>
          {memo.pinned ? (
            <MemoPinFilledIcon className="h-[16px] w-[16px] text-gray-950" aria-hidden="true" />
          ) : (
            <MemoPinIcon className="h-[16px] w-[16px]" aria-hidden="true" />
          )}
        </WidgetActionButton>

        <WidgetActionButton label="메모 수정" onClick={() => onEdit(memo)}>
          <EditIcon className="h-[16px] w-[16px]" aria-hidden="true" />
        </WidgetActionButton>

        <WidgetActionButton label="메모 삭제" onClick={() => onDelete(memo.id)}>
          <MemoDeleteIcon className="h-[16px] w-[16px]" aria-hidden="true" />
        </WidgetActionButton>
      </div>
    </article>
  );
}

export function MemoFloatingWidget() {
  const pathname = usePathname();
  const { memos, saveMemo, togglePinMemo, deleteMemo } = useMemoStore();

  const [open, setOpen] = useState(false);
  const [activeDraft, setActiveDraft] = useState<ActiveMemoDraft | null>(null);
  const [expandedMemoId, setExpandedMemoId] = useState<string | null>(null);

  const activeDraftRef = useRef<ActiveMemoDraft | null>(null);
  const activeEditorRef = useRef<HTMLDivElement | null>(null);

  const shouldHideWidget = pathname.startsWith('/mypage');

  useEffect(() => {
    activeDraftRef.current = activeDraft;
  }, [activeDraft]);

  const widgetMemos = useMemo(() => {
    return memos
      .filter((memo) => !memo.deleted)
      .map((memo, index) => ({
        memo,
        index,
      }))
      .sort((a, b) => {
        if (a.memo.pinned !== b.memo.pinned) {
          return Number(b.memo.pinned) - Number(a.memo.pinned);
        }

        return a.index - b.index;
      })
      .map(({ memo }) => memo);
  }, [memos]);

  const commitActiveDraft = useCallback(() => {
    const currentDraft = activeDraftRef.current;

    if (!currentDraft) return;

    activeDraftRef.current = null;
    setActiveDraft(null);

    const title = currentDraft.title.trim();
    const content = currentDraft.content;

    if (!title && !content.trim()) return;

    const payload: MemoSavePayload = {
      id: currentDraft.id,
      createdAt: currentDraft.createdAt,
      title: title || '제목',
      content: toMemoHtml(content),
      color: currentDraft.color,
      pinned: currentDraft.pinned,
      imageSrc: currentDraft.imageSrc,
      selected: currentDraft.selected,
      deleted: currentDraft.deleted,
    };

    saveMemo(payload);
  }, [saveMemo]);

  useEffect(() => {
    if (!activeDraft) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (activeEditorRef.current?.contains(event.target as Node)) return;

      commitActiveDraft();
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [activeDraft, commitActiveDraft]);

  const handleChangeDraft = (nextDraft: ActiveMemoDraft) => {
    activeDraftRef.current = nextDraft;
    setActiveDraft(nextDraft);
  };

  const handleOpenCreateDraft = () => {
    commitActiveDraft();

    const nextDraft: ActiveMemoDraft = {
      mode: 'create',
      title: '',
      content: '',
      pinned: false,
      selected: false,
      deleted: false,
    };

    activeDraftRef.current = nextDraft;
    setExpandedMemoId(null);
    setActiveDraft(nextDraft);
  };

  const handleOpenEditDraft = (memo: Memo) => {
    commitActiveDraft();

    const nextDraft = createDraftFromMemo(memo);

    activeDraftRef.current = nextDraft;
    setExpandedMemoId(null);
    setActiveDraft(nextDraft);
  };

  const handleToggleDraftPin = () => {
    const currentDraft = activeDraftRef.current;

    if (!currentDraft) return;

    const nextDraft = {
      ...currentDraft,
      pinned: !currentDraft.pinned,
    };

    activeDraftRef.current = nextDraft;
    setActiveDraft(nextDraft);
  };

  const handleDeleteDraft = () => {
    const currentDraft = activeDraftRef.current;

    if (currentDraft?.id) {
      deleteMemo(currentDraft.id);
    }

    activeDraftRef.current = null;
    setActiveDraft(null);
  };

  const handleCloseWidget = () => {
    commitActiveDraft();
    setOpen(false);
  };

  if (shouldHideWidget) {
    return null;
  }

  return (
    <>
      {open ? (
        <aside className="fixed right-[15px] bottom-[15px] z-40 box-border flex h-[702px] w-[450px] flex-col rounded-[20px] border border-gray-300 bg-white p-[20px]">
          <header className="mb-[18px] flex h-[28px] shrink-0 items-center">
            <Link
              href="/memo"
              onClick={() => {
                commitActiveDraft();
              }}
              className="flex h-[24px] items-center gap-[8px]"
            >
              <h2 className="text-[16px] leading-[24px] font-bold text-gray-950">메모</h2>

              <MemoWidgetHeaderArrow />
            </Link>
          </header>

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-full flex-col gap-[12px]">
              {activeDraft?.mode === 'create' ? (
                <WidgetMemoEditorCard
                  draft={activeDraft}
                  editorRef={activeEditorRef}
                  onChangeDraft={handleChangeDraft}
                  onTogglePin={handleToggleDraftPin}
                  onDelete={handleDeleteDraft}
                />
              ) : null}

              {widgetMemos.length > 0 ? (
                widgetMemos.map((memo) => {
                  if (activeDraft?.mode === 'edit' && activeDraft.id === memo.id) {
                    return (
                      <WidgetMemoEditorCard
                        key={memo.id}
                        draft={activeDraft}
                        editorRef={activeEditorRef}
                        onChangeDraft={handleChangeDraft}
                        onTogglePin={handleToggleDraftPin}
                        onDelete={handleDeleteDraft}
                      />
                    );
                  }

                  return (
                    <WidgetMemoCard
                      key={memo.id}
                      memo={memo}
                      expanded={expandedMemoId === memo.id}
                      onToggleExpand={() =>
                        setExpandedMemoId((prev) => (prev === memo.id ? null : memo.id))
                      }
                      onEdit={handleOpenEditDraft}
                      onTogglePin={togglePinMemo}
                      onDelete={deleteMemo}
                    />
                  );
                })
              ) : activeDraft?.mode !== 'create' ? (
                <div className="flex h-[160px] items-center justify-center rounded-[10px] border border-gray-300 bg-gray-50">
                  <p className="text-[14px] leading-[20px] font-medium text-gray-500">
                    작성된 메모가 없습니다.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <footer className="mt-[20px] flex shrink-0 justify-end gap-[12px]">
            <WidgetCircleButton label="메모 작성" onClick={handleOpenCreateDraft}>
              <MemoWidgetPlusIcon aria-hidden="true" />
            </WidgetCircleButton>

            <WidgetCircleButton label="메모 위젯 닫기" onClick={handleCloseWidget}>
              <MemoWidgetCloseIcon aria-hidden="true" />
            </WidgetCircleButton>
          </footer>
        </aside>
      ) : (
        <button
          type="button"
          aria-label="메모 위젯 열기"
          onClick={() => setOpen(true)}
          className="hover:border-secondary-700 hover:text-secondary-700 fixed right-[36px] bottom-[36px] z-40 flex h-[70px] w-[70px] items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition-colors"
        >
          <MemoWidgetIcon className="block h-[24px] w-[24px] shrink-0" aria-hidden="true" />
        </button>
      )}
    </>
  );
}

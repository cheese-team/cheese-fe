'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import {
  dropdownContentStyle,
  dropdownOptionInteractiveStyle,
  dropdownOptionStyle,
} from '@/components/common/styles/dropdown';

import { cn } from '@/lib/cn';

import { useSearchHistories } from '@/hooks/useSearchHistories';

import CreateIcon from '@/assets/icons/memo/create.svg';
import MemoCheckIcon from '@/assets/icons/memo/check.svg';
import MemoDeleteIcon from '@/assets/icons/memo/delete.svg';
import FilterChevronIcon from '@/assets/icons/memo/filter-chevron.svg';
import MemoFilterIcon from '@/assets/icons/memo/filter.svg';
import MemoPinFilledIcon from '@/assets/icons/memo/pin-filled.svg';
import MemoPinIcon from '@/assets/icons/memo/pin.svg';
import MemoSearchIcon from '@/assets/icons/memo/search.svg';

type MemoFilter = 'all' | 'pinned' | 'deleted';
type MemoSortOrder = 'latest' | 'oldest';

type MemoToolbarProps = {
  filter: MemoFilter;
  sortOrder: MemoSortOrder;
  searchValue: string;
  selectedCount: number;
  selectModeActive: boolean;
  onChangeFilter: (filter: MemoFilter) => void;
  onChangeSortOrder: (sortOrder: MemoSortOrder) => void;
  onChangeSearchValue: (value: string) => void;
  onToggleSelectMode: () => void;
  onDeleteSelected: () => void;
  onCreate: () => void;
};

const SORT_OPTIONS: Array<{ label: string; value: MemoSortOrder }> = [
  { label: '최신순', value: 'latest' },
  { label: '오래된순', value: 'oldest' },
];

const MEMO_SEARCH_HISTORIES = ['면접', '포트폴리오', '일정', 'CSS', 'Next.js'] as const;

function DropdownChevron({ open }: { open: boolean }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center">
      <FilterChevronIcon
        aria-hidden="true"
        className={cn(
          'block h-6 w-2.5 shrink-0 origin-center transition-transform',
          open && 'rotate-180',
        )}
      />
    </span>
  );
}

function ToolbarIconButton({
  active,
  disabled,
  children,
  label,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex h-11 w-12 items-center justify-center rounded-[10px] border bg-white transition-colors',
        active
          ? 'border-secondary-600 text-secondary-600 border-2'
          : 'hover:border-secondary-600 hover:text-secondary-600 border-gray-400 text-gray-500',
        disabled && 'cursor-not-allowed opacity-40 hover:border-gray-400 hover:text-gray-500',
      )}
    >
      <span className="flex size-6 items-center justify-center [&>svg]:block [&>svg]:shrink-0">
        {children}
      </span>
    </button>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: MemoSortOrder;
  onChange: (value: MemoSortOrder) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = SORT_OPTIONS.find((option) => option.value === value)?.label ?? '최신순';

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
        aria-label={`메모 정렬: ${selectedLabel}`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-11 w-[68px] items-center justify-center gap-4 rounded-[10px] border bg-white px-3 transition-colors',
          open
            ? 'border-secondary-600 text-secondary-600 border-2 px-[11px]'
            : 'hover:border-secondary-600 hover:text-secondary-600 border-gray-400 text-gray-500',
        )}
      >
        <MemoFilterIcon className="h-6 w-4 shrink-0 [&_path]:fill-current" aria-hidden="true" />
        <FilterChevronIcon
          className="h-6 w-2.5 shrink-0 [&_path]:fill-current"
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          className={cn(
            dropdownContentStyle,
            'absolute top-[52px] left-0 z-30 flex w-[200px] flex-col gap-2 overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.12)]',
          )}
        >
          {SORT_OPTIONS.map((option) => {
            const selected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  dropdownOptionStyle,
                  dropdownOptionInteractiveStyle,
                  selected && 'bg-gray-200',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function MemoSearchBox({
  value,
  histories,
  onChange,
  onSubmit,
  onHistorySelect,
}: {
  value: string;
  histories: readonly string[];
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onHistorySelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

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

  const handleSubmit = () => {
    const normalizedValue = value.trim();

    onSubmit(normalizedValue);
    setOpen(false);
  };

  const handleHistoryClick = (history: string) => {
    onHistorySelect(history);
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    handleSubmit();
  };

  return (
    <div ref={rootRef} className="relative">
      <div
        className={cn(
          'flex h-11 w-[500px] items-center gap-2 rounded-[10px] border p-3 text-gray-500 transition-colors',
          open ? 'border-secondary-700' : 'border-gray-300',
        )}
      >
        <MemoSearchIcon className="size-5 shrink-0" aria-hidden="true" />

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메모 검색"
          className="h-5 min-w-0 flex-1 bg-transparent text-[14px] leading-5 font-medium tracking-[-0.02em] text-gray-800 outline-none placeholder:text-gray-500"
        />

        <button
          type="button"
          aria-label="메모 검색 기록 열기"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="hover:text-secondary-700 flex size-6 shrink-0 items-center justify-center text-gray-500 transition-colors"
        >
          <DropdownChevron open={open} />
        </button>
      </div>

      {open ? (
        <div
          className={cn(
            dropdownContentStyle,
            'absolute top-[52px] left-0 z-40 w-full overflow-hidden px-0 shadow-[0_8px_24px_rgba(0,0,0,0.12)]',
          )}
        >
          <div className="px-[14px] pb-[6px] text-[12px] font-medium text-gray-500">
            최근 검색어
          </div>

          {histories.length > 0 ? (
            <div className="max-h-[180px] overflow-y-auto">
              {histories.map((history) => (
                <button
                  key={history}
                  type="button"
                  onClick={() => handleHistoryClick(history)}
                  className="flex h-[34px] w-full items-center px-[14px] text-left text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950"
                >
                  {history}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex h-[42px] items-center px-[14px] text-[13px] font-medium text-gray-500">
              최근 검색어가 없습니다.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function MemoToolbar({
  filter,
  sortOrder,
  searchValue,
  selectedCount,
  selectModeActive,
  onChangeFilter,
  onChangeSortOrder,
  onChangeSearchValue,
  onToggleSelectMode,
  onDeleteSelected,
  onCreate,
}: MemoToolbarProps) {
  const isPinnedActive = filter === 'pinned';
  const isDeletedActive = filter === 'deleted';

  const { histories: memoSearchHistories, addHistory: addMemoSearchHistory } = useSearchHistories(
    'memo',
    MEMO_SEARCH_HISTORIES,
  );

  const handleSearchSubmit = (value: string) => {
    const normalizedValue = value.trim();

    if (normalizedValue) {
      addMemoSearchHistory(normalizedValue);
    }

    onChangeSearchValue(normalizedValue);
  };

  const handleSearchHistorySelect = (value: string) => {
    const normalizedValue = value.trim();

    if (normalizedValue) {
      addMemoSearchHistory(normalizedValue);
    }

    onChangeSearchValue(normalizedValue);
  };

  return (
    <div className="mb-10 flex items-center justify-center gap-5">
      <div className="flex items-center gap-3">
        <SortDropdown value={sortOrder} onChange={onChangeSortOrder} />

        <div className="flex items-center gap-3">
          <ToolbarIconButton
            label="고정 메모 보기"
            active={isPinnedActive}
            onClick={() => onChangeFilter(isPinnedActive ? 'all' : 'pinned')}
          >
            {isPinnedActive ? (
              <MemoPinFilledIcon className="h-[14.93px] w-[14.966px]" aria-hidden="true" />
            ) : (
              <MemoPinIcon className="h-[14.93px] w-[14.966px]" aria-hidden="true" />
            )}
          </ToolbarIconButton>

          <ToolbarIconButton
            label={selectModeActive ? '전체 선택 해제' : '전체 선택'}
            active={selectModeActive}
            onClick={onToggleSelectMode}
          >
            <MemoCheckIcon
              className={cn(
                'size-4',
                selectModeActive &&
                  '[&_rect:first-of-type]:fill-secondary-600 [&_rect:nth-of-type(2)]:stroke-secondary-600 [&_path]:fill-white',
              )}
              aria-hidden="true"
            />
          </ToolbarIconButton>

          <ToolbarIconButton
            label={selectedCount > 0 ? '선택한 메모 삭제' : '삭제된 메모 보기'}
            active={isDeletedActive}
            onClick={() => {
              if (selectedCount > 0) {
                onDeleteSelected();
                return;
              }

              onChangeFilter(isDeletedActive ? 'all' : 'deleted');
            }}
          >
            <MemoDeleteIcon className="h-4 w-[13.6px]" aria-hidden="true" />
          </ToolbarIconButton>
        </div>
      </div>

      <MemoSearchBox
        value={searchValue}
        histories={memoSearchHistories}
        onChange={onChangeSearchValue}
        onSubmit={handleSearchSubmit}
        onHistorySelect={handleSearchHistorySelect}
      />

      <button
        type="button"
        onClick={onCreate}
        className="bg-secondary-600 flex h-11 w-[76px] items-center justify-center gap-1 rounded-[10px] px-3 text-[14px] leading-6 font-medium tracking-[-0.02em] text-white"
      >
        <span className="flex size-6 shrink-0 items-center justify-center">
          <CreateIcon className="size-6" aria-hidden="true" />
        </span>
        생성
      </button>
    </div>
  );
}

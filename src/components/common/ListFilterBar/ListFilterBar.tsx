'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import ChevronIcon from '@/assets/icons/common/chevron.svg';
import CloseIcon from '@/assets/icons/common/close.svg';
import CreateIcon from '@/assets/icons/common/create.svg';
import { cn } from '@/lib/cn';

export type ListFilterOption<TValue extends string = string> = {
  label: string;
  value: TValue;
};

type ListFilterActionButton = {
  label: string;
  onClick: () => void;
};

type ListFilterBarProps<TSort extends string = string> = {
  sortOptions: readonly ListFilterOption<TSort>[];
  selectedSort: TSort;
  onSortChange: (value: TSort) => void;

  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
  onSearchClear?: () => void;
  onSearchHistorySelect?: (value: string) => void;

  searchPlaceholder?: string;
  searchHistories?: readonly string[];

  actionButton?: ListFilterActionButton;

  className?: string;
  searchClassName?: string;
};

function SortIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path
        d="M4 5h8M4 10h6M4 15h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M15 4v10M15 14l-2.5-2.5M15 14l2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path
        d="m14.2 14.2 3 3M8.8 15.2a6.4 6.4 0 1 1 0-12.8 6.4 6.4 0 0 1 0 12.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DropdownChevron({ open }: { open: boolean }) {
  return (
    <span className="flex h-[12px] w-[12px] shrink-0 items-center justify-center overflow-visible">
      <ChevronIcon
        aria-hidden="true"
        className={cn(
          'block h-[12px] w-[7px] shrink-0 origin-center text-current transition-transform',
          open ? '-rotate-90' : 'rotate-90',
        )}
      />
    </span>
  );
}

function DropdownContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'absolute top-[52px] left-0 z-40 overflow-hidden rounded-[10px] border border-gray-300 bg-white py-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function SortDropdown<TSort extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly ListFilterOption<TSort>[];
  value: TSort;
  onChange: (value: TSort) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = options.find((option) => option.value === value)?.label ?? '';

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
        aria-label={`정렬: ${selectedLabel}`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-[44px] w-[68px] items-center justify-center gap-[8px] rounded-[10px] border transition-colors',
          open
            ? 'border-secondary-700 text-secondary-700'
            : 'hover:border-secondary-700 hover:text-secondary-700 border-gray-300 text-gray-500',
        )}
      >
        <SortIcon className="h-[20px] w-[20px]" />

        <DropdownChevron open={open} />
      </button>

      {open ? (
        <DropdownContainer className="w-[110px]">
          {options.map((option) => {
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
                  'flex h-[32px] w-full items-center px-[12px] text-left text-[13px] font-medium transition-colors hover:bg-gray-100',
                  selected ? 'text-secondary-700' : 'text-gray-700',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </DropdownContainer>
      ) : null}
    </div>
  );
}

function SearchHistoryDropdown({
  histories,
  onSelect,
}: {
  histories: readonly string[];
  onSelect: (value: string) => void;
}) {
  return (
    <DropdownContainer className="w-full">
      <div className="px-[14px] pb-[6px] text-[12px] font-medium text-gray-500">최근 검색어</div>

      {histories.length > 0 ? (
        <div className="max-h-[180px] overflow-y-auto">
          {histories.map((history) => (
            <button
              key={history}
              type="button"
              onClick={() => onSelect(history)}
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
    </DropdownContainer>
  );
}

function SearchInput({
  value,
  placeholder,
  histories,
  onChange,
  onSubmit,
  onClear,
  onHistorySelect,
  className,
}: {
  value: string;
  placeholder: string;
  histories: readonly string[];
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onClear?: () => void;
  onHistorySelect?: (value: string) => void;
  className?: string;
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

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }

    setOpen(false);
  };

  const handleHistorySelect = (history: string) => {
    if (onHistorySelect) {
      onHistorySelect(history);
    } else {
      onChange(history);
      onSubmit(history);
    }

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
          'flex h-[44px] w-[500px] items-center gap-[10px] rounded-[8px] border px-[14px] text-gray-500 transition-colors',
          open ? 'border-secondary-700' : 'border-gray-300',
          className,
        )}
      >
        <SearchIcon className="h-[18px] w-[18px] shrink-0" />

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-medium text-gray-800 outline-none placeholder:text-gray-500"
        />

        {value ? (
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={handleClear}
            className="hover:text-secondary-700 flex h-[24px] w-[24px] shrink-0 items-center justify-center text-gray-500 transition-colors"
          >
            <CloseIcon className="h-[12px] w-[12px]" aria-hidden="true" />
          </button>
        ) : null}

        <button
          type="button"
          aria-label="검색 기록 열기"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="hover:text-secondary-700 flex h-[24px] w-[24px] shrink-0 items-center justify-center text-gray-500 transition-colors"
        >
          <DropdownChevron open={open} />
        </button>
      </div>

      {open ? <SearchHistoryDropdown histories={histories} onSelect={handleHistorySelect} /> : null}
    </div>
  );
}

export function ListFilterBar<TSort extends string = string>({
  sortOptions,
  selectedSort,
  onSortChange,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  onSearchHistorySelect,
  searchPlaceholder = '검색',
  searchHistories = [],
  actionButton,
  className,
  searchClassName,
}: ListFilterBarProps<TSort>) {
  return (
    <div className={cn('flex items-center gap-[10px]', className)}>
      <SortDropdown options={sortOptions} value={selectedSort} onChange={onSortChange} />

      <SearchInput
        value={searchValue}
        placeholder={searchPlaceholder}
        histories={searchHistories}
        onChange={onSearchChange}
        onSubmit={onSearchSubmit}
        onClear={onSearchClear}
        onHistorySelect={onSearchHistorySelect}
        className={searchClassName}
      />

      {actionButton ? (
        <button
          type="button"
          onClick={actionButton.onClick}
          className="bg-secondary-700 hover:bg-secondary-800 flex h-[44px] items-center justify-center gap-[8px] rounded-[10px] px-[18px] text-[14px] font-medium text-white transition-colors"
        >
          <CreateIcon className="h-[16px] w-[16px]" aria-hidden="true" />
          {actionButton.label}
        </button>
      ) : null}
    </div>
  );
}

export default ListFilterBar;

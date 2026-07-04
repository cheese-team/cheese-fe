import type { ReactNode } from 'react';

export type ListFilterSortOption<TValue extends string = string> = {
  label: string;
  value: TValue;
  disabled?: boolean;
};

export type ListFilterActionButton = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode | false;
};

export type ListFilterBarProps<TSortValue extends string = string> = {
  sortOptions?: readonly ListFilterSortOption<TSortValue>[];
  selectedSort?: TSortValue;
  onSortChange?: (value: TSortValue) => void;

  searchValue?: string;
  searchPlaceholder?: string;
  searchHistories?: readonly string[];
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  onSearchClear?: () => void;
  onSearchHistorySelect?: (value: string) => void;

  actionButton?: ListFilterActionButton;

  className?: string;
};

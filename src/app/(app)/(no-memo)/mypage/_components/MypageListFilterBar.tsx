'use client';

import { useEffect, useState, type ComponentProps } from 'react';
import ListFilterBar from '@/components/common/ListFilterBar';

type MypageListFilterBarProps<TSort extends string> = Omit<
  ComponentProps<typeof ListFilterBar<TSort>>,
  'onSearchChange'
>;

export default function MypageListFilterBar<TSort extends string>({
  searchValue,
  onSearchSubmit,
  onSearchClear,
  onSearchHistorySelect,
  ...props
}: MypageListFilterBarProps<TSort>) {
  const [draft, setDraft] = useState(searchValue);

  useEffect(() => {
    setDraft(searchValue);
  }, [searchValue]);

  return (
    <ListFilterBar
      {...props}
      searchValue={draft}
      onSearchChange={setDraft}
      onSearchSubmit={(value) => {
        setDraft(value);
        onSearchSubmit(value);
      }}
      onSearchClear={() => {
        setDraft('');
        onSearchClear?.();
      }}
      onSearchHistorySelect={(value) => {
        setDraft(value);
        (onSearchHistorySelect ?? onSearchSubmit)(value);
      }}
    />
  );
}

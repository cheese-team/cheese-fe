'use client';

import { useState } from 'react';

import type { MypageModalItem } from './types';

export function useMypageModal() {
  const [editingItem, setEditingItem] = useState<MypageModalItem | null>(null);

  const openModal = (item: MypageModalItem) => {
    setEditingItem(item);
  };

  const closeModal = () => {
    setEditingItem(null);
  };

  return {
    editingItem,
    openModal,
    closeModal,
  };
}

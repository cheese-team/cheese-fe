'use client';

import { useId, useState } from 'react';

import { Input } from '@/components/common/Input';
import MypageModalLayout from './MypageModalLayout';

import ChevronIcon from '@/assets/icons/common/chevron.svg';

import { CONTACT_METHOD_OPTIONS } from '@/constants/profileOptions';

import type { SelectEditValue } from './types';

type SelectEditModalProps = {
  title: string;
  inputLabel: string;
  value?: string;
  contactUrl?: string;
  options: string[];
  isOpen: boolean;
  onClose: () => void;
  hasOpenKakaoInput?: boolean;
  onSave: (value: SelectEditValue) => void;
};

export default function SelectEditModal({
  title,
  inputLabel,
  value,
  contactUrl,
  options,
  isOpen,
  onClose,
  hasOpenKakaoInput,
  onSave,
}: SelectEditModalProps) {
  const formId = useId();

  const [selectedValue, setSelectedValue] = useState(value);
  const [openKakaoUrl, setOpenKakaoUrl] = useState(contactUrl ?? '');

  const isOpenKakaoSelected = hasOpenKakaoInput && selectedValue === '오픈 카카오톡';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedValue) return;

    if (hasOpenKakaoInput) {
      const contactMethod = CONTACT_METHOD_OPTIONS.find(
        (option) => option.label === selectedValue,
      )?.value;

      if (!contactMethod) return;

      onSave({
        contactMethod,
        contactUrl: contactMethod === 'kakaoOpenChat' ? openKakaoUrl : undefined,
      });

      return;
    }

    // TODO: API 요청
    onSave(selectedValue);
  };

  return (
    <MypageModalLayout isOpen={isOpen} onClose={onClose} title={title} submitFormId={formId}>
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor={`${formId}-select`} className="sr-only">
          {inputLabel}
        </label>

        {/* TODO: custom option으로 교체 (공통 컴포넌트) */}
        <div className="flex h-10 w-full items-center gap-2 border-b border-gray-400 px-2">
          <select
            id={`${formId}-select`}
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            className="flex-1 appearance-none outline-none"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <ChevronIcon className="pointer-events-none h-[10px] rotate-90 text-gray-500" />
        </div>
        {isOpenKakaoSelected && (
          <Input
            label="오픈 카카오톡 URL"
            placeholder="오픈 카카오톡 URL 입력"
            className="h-10 px-2"
            value={openKakaoUrl}
            onChange={(e) => setOpenKakaoUrl(e.target.value)}
          />
        )}
      </form>
    </MypageModalLayout>
  );
}

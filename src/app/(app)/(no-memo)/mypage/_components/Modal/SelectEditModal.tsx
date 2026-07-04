'use client';

import { useId, useState } from 'react';

import { Input } from '@/components/common/Input';
import MypageModalLayout from './MypageModalLayout';

import ChevronIcon from '@/assets/icons/common/chevron.svg';

type SelectEditModalProps = {
  title: string;
  inputLabel: string;
  value?: string;
  options: string[];
  isOpen: boolean;
  onClose: () => void;
  hasOpenKakaoInput?: boolean;
};

export default function SelectEditModal({
  title,
  inputLabel,
  value,
  options,
  isOpen,
  onClose,
  hasOpenKakaoInput,
}: SelectEditModalProps) {
  const formId = useId();
  const [selectedValue, setSelectedValue] = useState(value);
  const [openKakaoUrl, setOpenKakaoUrl] = useState('');

  const isOpenKakaoSelected = hasOpenKakaoInput && selectedValue === '오픈 카카오톡';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO: API 요청

    onClose();
  };

  return (
    <MypageModalLayout isOpen={isOpen} onClose={onClose} title={title} submitFormId={formId}>
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor={`${formId}-select`} className="sr-only">
          {inputLabel}
        </label>

        {/* TODO: custom option으로 교체 (공통 컴포넌트) */}
        <div className="flex w-full items-center gap-2 border-b border-gray-400 px-2 py-[10.5px]">
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
            value={openKakaoUrl}
            hideMessageSpace
            onChange={(e) => setOpenKakaoUrl(e.target.value)}
          />
        )}
      </form>
    </MypageModalLayout>
  );
}

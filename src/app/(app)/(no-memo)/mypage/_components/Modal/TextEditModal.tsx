'use client';

import { useId, useState } from 'react';

import { Input } from '@/components/common/Input';
import MypageModalLayout from './MypageModalLayout';

type TextEditModalProps = {
  title: string;
  inputLabel: string;
  description?: string;
  value?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
};

export default function TextEditModal({
  title,
  inputLabel,
  description,
  value,
  isOpen,
  onClose,
  onSave,
}: TextEditModalProps) {
  const [inputValue, setInputValue] = useState(value ?? '');

  const formId = useId();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO: API 요청
    onSave(inputValue);
  };

  return (
    <MypageModalLayout isOpen={isOpen} onClose={onClose} title={title} submitFormId={formId}>
      <form id={formId} onSubmit={handleSubmit}>
        <Input
          label={inputLabel}
          value={inputValue}
          placeholder={`${inputLabel} 입력`}
          className="h-10 px-2"
          onChange={(e) => setInputValue(e.target.value)}
        />

        {description && <p className="mt-3 text-[12px]">{description}</p>}
      </form>
    </MypageModalLayout>
  );
}

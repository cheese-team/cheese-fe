'use client';

import { useId, useState } from 'react';

import { Input } from '@/components/common/Input';
import MypageModalLayout from './MypageModalLayout';

type TextEditModalProps = {
  title: string;
  inputLabel: string;
  description?: string;
  value?: string;
  inputType?: React.HTMLInputTypeAttribute;
  min?: number;
  maxLength?: number;
  validate?: (value: string) => string | undefined;
  isOpen: boolean;
  disabled: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
};

export default function TextEditModal({
  title,
  inputLabel,
  description,
  value,
  inputType = 'text',
  min,
  maxLength,
  validate,
  isOpen,
  disabled,
  onClose,
  onSave,
}: TextEditModalProps) {
  const [inputValue, setInputValue] = useState(value ?? '');
  const [error, setError] = useState<string>();

  const formId = useId();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (disabled) return;

    const validationError = validate?.(inputValue);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(undefined);
    onSave(validate ? inputValue.trim() : inputValue);
  };

  return (
    <MypageModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      submitFormId={formId}
      disabled={disabled}
    >
      <form id={formId} onSubmit={handleSubmit} noValidate={!!validate}>
        <Input
          type={inputType}
          min={min}
          maxLength={maxLength}
          label={inputLabel}
          value={inputValue}
          placeholder={`${inputLabel} 입력`}
          className="h-10 px-2"
          disabled={disabled}
          errorMessage={error}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(undefined);
          }}
        />

        {description && <p className="mt-3 text-[12px]">{description}</p>}
      </form>
    </MypageModalLayout>
  );
}

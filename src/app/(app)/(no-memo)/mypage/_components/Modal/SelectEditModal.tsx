'use client';

import { useId, useState } from 'react';

import { Input, InputActionButton } from '@/components/common/Input';
import EmailVerifyForm from '@/app/(public)/_components/EmailVerifyForm';
import MypageModalLayout from './MypageModalLayout';

import ChevronIcon from '@/assets/icons/common/chevron.svg';

import { validateEmail } from '@/app/(public)/(auth)/_lib/validation';

import { CONTACT_METHOD_OPTIONS } from '@/constants/profileOptions';

import type { SelectEditValue } from './types';

type SelectEditModalProps = {
  title: string;
  inputLabel: string;
  value?: string;
  contactUrl?: string;
  contactEmail?: string;
  options: string[];
  isOpen: boolean;
  disabled: boolean;
  onClose: () => void;
  hasContactInput?: boolean;
  onSave: (value: SelectEditValue) => void;
};

const validateContactUrl = (value: string): string | undefined => {
  const trimmedUrl = value.trim();

  if (!trimmedUrl) {
    return 'URL을 입력해 주세요.';
  }

  try {
    const parsedUrl = new URL(trimmedUrl);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return 'http 또는 https URL을 입력해 주세요.';
    }
  } catch {
    return '올바른 URL 형식으로 입력해 주세요.';
  }

  return undefined;
};

export default function SelectEditModal({
  title,
  inputLabel,
  value,
  contactUrl,
  contactEmail,
  options,
  isOpen,
  disabled,
  onClose,
  hasContactInput,
  onSave,
}: SelectEditModalProps) {
  const formId = useId();

  const [selectedValue, setSelectedValue] = useState(value);

  const [url, setUrl] = useState(contactUrl ?? '');
  const [email, setEmail] = useState(contactEmail ?? '');

  const [verifiedEmail, setVerifiedEmail] = useState<string>();
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const [emailError, setEmailError] = useState<string>();
  const [urlError, setUrlError] = useState<string>();

  const isDisabled = disabled;

  const isEmailSelected = hasContactInput && selectedValue === '이메일';
  const hasUrlInput =
    hasContactInput && (selectedValue === '오픈 카카오톡' || selectedValue === '구글 폼');
  const needsEmailVerification =
    isEmailSelected &&
    email.trim() !== (contactEmail ?? '').trim() &&
    email.trim() !== verifiedEmail;

  // TODO: contact-change 인증 시 본인의 로그인 이메일로 변경하면
  // 인증번호 발송 단계에서 400 오류 발생
  // 백엔드에서 본인 loginEmail에 대한 중복 검증 예외 처리 필요 여부 확인
  const handleSendEmail = () => {
    if (isDisabled) return;
    const normalizedEmail = email.trim();
    const validationError = validateEmail(normalizedEmail);
    setEmailError(validationError);
    if (validationError) return;
    setEmail(normalizedEmail);
    setIsVerifyingEmail(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isDisabled || isVerifyingEmail || needsEmailVerification) return;
    if (!selectedValue) return;

    if (hasContactInput) {
      const contactMethod = CONTACT_METHOD_OPTIONS.find(
        (option) => option.label === selectedValue,
      )?.value;

      if (!contactMethod) return;

      if (contactMethod !== 'email') {
        const validationError = validateContactUrl(url);

        setUrlError(validationError);

        if (validationError) return;
      }

      onSave({
        contactMethod,
        contactUrl: contactMethod === 'email' ? '' : url.trim(),
        contactEmail: contactMethod === 'email' ? email.trim() : undefined,
      });

      return;
    }

    onSave(selectedValue);
  };

  return (
    <MypageModalLayout
      isOpen={isOpen}
      onClose={() => {
        if (!isDisabled) onClose();
      }}
      title={title}
      submitFormId={formId}
      disabled={isDisabled || isVerifyingEmail || needsEmailVerification}
    >
      {isVerifyingEmail ? (
        <>
          <EmailVerifyForm
            purpose="contact-change"
            emailLabel="연락용 이메일"
            initialEmail={email.trim()}
            sendOnOpen
            emailDisabled
            onNext={(verified) => {
              setEmail(verified);
              setVerifiedEmail(verified);
              setIsVerifyingEmail(false);
            }}
          />
          <button
            type="button"
            className="mt-3 text-sm text-gray-700 underline"
            onClick={() => setIsVerifyingEmail(false)}
          >
            돌아가기
          </button>
        </>
      ) : (
        <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor={`${formId}-select`} className="sr-only">
            {inputLabel}
          </label>

          {/* TODO: custom option으로 교체 (공통 컴포넌트) */}
          <div className="flex h-10 w-full items-center gap-2 border-b border-gray-400 px-2">
            <select
              id={`${formId}-select`}
              value={selectedValue}
              disabled={isDisabled}
              onChange={(e) => {
                setSelectedValue(e.target.value);
                setUrl(e.target.value === value ? (contactUrl ?? '') : '');
                setUrlError(undefined);
              }}
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
          {isEmailSelected && (
            <Input
              type="email"
              required
              label="연락용 이메일"
              placeholder="연락용 이메일 입력"
              className="h-10 px-2"
              value={email}
              disabled={isDisabled}
              errorMessage={emailError}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(undefined);
                setVerifiedEmail(undefined);
              }}
              successMessage={email.trim() === verifiedEmail ? '인증이 완료되었습니다.' : undefined}
              rightAddon={
                needsEmailVerification ? (
                  <InputActionButton disabled={isDisabled} onClick={handleSendEmail}>
                    이메일 인증
                  </InputActionButton>
                ) : undefined
              }
            />
          )}
          {hasUrlInput && (
            <Input
              label={`${selectedValue} URL`}
              placeholder={`${selectedValue} URL 입력`}
              className="h-10 px-2"
              value={url}
              disabled={isDisabled}
              errorMessage={urlError}
              onChange={(e) => {
                setUrl(e.target.value);
                setUrlError(undefined);
              }}
            />
          )}
        </form>
      )}
    </MypageModalLayout>
  );
}

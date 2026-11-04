'use client';

import { useState } from 'react';

import { Input, type InputProps } from '@/components/common/Input';

import { EyeIcon, EyeOffIcon } from '@/assets/icons/auth';

type PasswordInputProps = Omit<InputProps, 'type' | 'rightAddon'>;

export default function PasswordInput(props: PasswordInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <Input
      {...props}
      type={isPasswordVisible ? 'text' : 'password'}
      rightAddon={
        <button
          type="button"
          aria-label={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 표시'}
          aria-pressed={isPasswordVisible}
          disabled={props.disabled}
          onClick={() => setIsPasswordVisible((prev) => !prev)}
          className="mr-2 flex items-center justify-center text-gray-300 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          {isPasswordVisible ? (
            <EyeOffIcon className="h-4.5 w-5" />
          ) : (
            <EyeIcon className="h-4.5 w-5" />
          )}
        </button>
      }
    />
  );
}

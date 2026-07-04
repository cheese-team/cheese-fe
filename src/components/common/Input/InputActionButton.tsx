'use client';

import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type InputActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function InputActionButton({
  className,
  children,
  type = 'button',
  ...rest
}: InputActionButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center',
        'h-[30px] px-3 py-2',
        'whitespace-nowrap',
        'rounded-[5px]',
        'bg-primary-700',
        'text-[12px] font-medium text-gray-950',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

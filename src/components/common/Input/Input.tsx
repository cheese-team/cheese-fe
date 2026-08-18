'use client';

import { useId } from 'react';

import { cn } from '@/lib/cn';

import type { InputProps } from './type';

export default function Input({
  label,
  errorMessage,
  successMessage,
  rightAddon,
  showMessageSpace = false,
  id,
  className,
  inputClassName,
  ref,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  const isDisabled = !!rest.disabled;

  const hasError = !!errorMessage;
  const hasSuccess = !hasError && !!successMessage;
  const messageId = `${inputId}-message`;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          'flex items-center',
          'gap-2',
          'border-b transition-[border-color] duration-150',
          !isDisabled && 'border-gray-400',
          !isDisabled && 'focus-within:border-secondary-600 focus-within:border-b-2',
          isDisabled && 'border-gray-300',
          className,
        )}
      >
        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={hasError || hasSuccess ? messageId : undefined}
          className={cn(
            'my-[5px] min-w-0 flex-1',
            'border-0 bg-transparent',
            'placeholder:text-text-placeholder',
            'focus:outline-none',
            isDisabled && 'text-text-muted placeholder:text-text-placeholder',
            inputClassName,
          )}
          {...rest}
        />

        {rightAddon ? <div className="flex shrink-0 items-center">{rightAddon}</div> : null}
      </div>

      {/* message (optional) */}
      {(hasError || hasSuccess || showMessageSpace) && (
        <div className="flex h-[22px] items-end text-xs font-medium tracking-[-0.04em]">
          {hasError ? (
            <p id={messageId} className="text-text-error">
              {errorMessage}
            </p>
          ) : hasSuccess ? (
            <p id={messageId} role="status" className="text-text-success">
              {successMessage}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

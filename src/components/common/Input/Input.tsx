'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';
import type { UnderlinedInputProps } from './type';

export default function Input({
  label,
  errorMessage,
  successMessage,
  rightAddon,
  hideMessageSpace = false,
  id,
  className,
  inputClassName,
  ...rest
}: UnderlinedInputProps) {
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
          'gap-2 px-2 py-[5px]',
          'border-b transition-[border-color] duration-150',
          !isDisabled && 'border-gray-400',
          !isDisabled && 'focus-within:border-gray-800',
          isDisabled && 'border-gray-300',
          className,
        )}
      >
        <input
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={hasError ? messageId : undefined}
          className={cn(
            'my-[5.5px] h-[19px] min-w-0 flex-1',
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
      {(hasError || hasSuccess || !hideMessageSpace) && (
        <div className={cn(!hideMessageSpace && 'h-[22px]', 'text-left text-xs font-medium')}>
          {hasError ? (
            <p id={messageId} className="text-text-error pt-2">
              {errorMessage}
            </p>
          ) : hasSuccess ? (
            <p className="text-text-success mt-2">{successMessage}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

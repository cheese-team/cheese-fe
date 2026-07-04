'use client';

import { useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import CheckIcon from '@/assets/icons/common/check.svg';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
};

export default function Checkbox({ id, label, className, ...rest }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label
      className={cn(
        'inline-flex w-fit cursor-pointer items-center gap-[4px] select-none',
        className,
      )}
    >
      <input id={inputId} type="checkbox" className="peer sr-only" {...rest} />

      <span
        className={cn(
          'relative inline-flex items-center justify-center',
          'h-5 w-5 rounded-xs',
          'border-primary-700 border',
          'peer-checked:bg-primary-700',
          'peer-checked:[&>svg]:opacity-100',
        )}
      >
        <CheckIcon className="h-3 w-3 text-gray-50 opacity-0 transition-opacity" />
      </span>

      {label ? <span className="text-sm font-normal">{label}</span> : null}
    </label>
  );
}

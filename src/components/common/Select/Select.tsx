'use client';

import type { ReactNode } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';

import { dropdownContentStyle, dropdownOptionStyle } from '@/components/common/styles/dropdown';

import { cn } from '@/lib/cn';

import ArrowIcon from '@/assets/icons/common/arrow.svg';

import type { Option } from '@/types/option';

export type SelectProps = {
  name?: string;
  value: string;
  options: readonly Option[];
  placeholder?: string;
  leadingIcon?: ReactNode;
  onChange: (value: string) => void;
  triggerClassName?: string;
  contentClassName?: string;
  optionClassName?: string;
  arrowIconClassName?: string;
};

export default function Select({
  name,
  value,
  options,
  placeholder = '선택',
  leadingIcon,
  onChange,
  triggerClassName,
  contentClassName,
  optionClassName,
  arrowIconClassName,
}: SelectProps) {
  return (
    <SelectPrimitive.Root name={name} value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger
        className={cn(
          'group flex h-[30px] w-full items-center justify-between pr-5 font-medium',
          'border-b border-gray-400',
          'data-[placeholder]:text-gray-500',
          'data-[state=open]:border-secondary-600',
          'data-[state=open]:rounded-[10px]',
          'data-[state=open]:border-2',
          'data-[state=open]:pl-5',
          triggerClassName,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {leadingIcon}

          <SelectPrimitive.Value placeholder={placeholder} />
        </span>

        <SelectPrimitive.Icon asChild>
          <ArrowIcon
            className={cn(
              'h-[10px] rotate-[-90deg] text-gray-500 transition-transform',
              'group-data-[state=open]:rotate-90',
              arrowIconClassName,
            )}
            aria-hidden="true"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          side="bottom"
          align="start"
          sideOffset={8}
          onEscapeKeyDown={(event) => {
            event.stopPropagation();
          }}
          className={cn(
            dropdownContentStyle,
            'z-[60] w-[var(--radix-select-trigger-width)]',
            contentClassName,
          )}
        >
          <SelectPrimitive.Viewport className="flex flex-col gap-2">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  dropdownOptionStyle,
                  'data-[highlighted]:bg-gray-200',
                  'data-[state=checked]:bg-gray-200',
                  optionClassName,
                )}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

'use client';

import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode, RefObject } from 'react';
import { createPortal } from 'react-dom';

import { dropdownContentStyle } from '@/components/common/styles/dropdown';
import { cn } from '@/lib/cn';
import DropdownChevronIcon from '@/assets/icons/calendar/dropdown-chevron.svg';

type CalendarFieldPopoverProps = {
  label: string;
  displayValue: string;
  width: number;
  children: (close: () => void) => ReactNode;
};

function FieldPanel({
  id,
  label,
  width,
  triggerRef,
  onClose,
  children,
}: {
  id: string;
  label: string;
  width: number;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger) return;

    const updatePosition = () => {
      const anchor = trigger.getBoundingClientRect();
      const padding = 12;
      const gap = 8;
      panel.style.width = `${Math.min(width, window.innerWidth - padding * 2)}px`;
      const bounds = panel.getBoundingClientRect();
      const left = Math.max(
        padding,
        Math.min(anchor.left, window.innerWidth - bounds.width - padding),
      );
      const below = anchor.bottom + gap;
      const top =
        below + bounds.height <= window.innerHeight - padding
          ? below
          : Math.max(padding, anchor.top - gap - bounds.height);
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
    };

    updatePosition();
    panel.querySelectorAll<HTMLElement>('[role="option"][aria-selected="true"]').forEach((item) => {
      item.scrollIntoView({ block: 'nearest' });
    });
    panel.querySelector<HTMLElement>('[data-picker-autofocus]')?.focus({ preventScroll: true });
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      if (trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [triggerRef, width]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
    if (event.key !== 'Tab') return;

    const buttons = panelRef.current?.querySelectorAll<HTMLButtonElement>(
      'button:not(:disabled):not([tabindex="-1"])',
    );
    if (!buttons?.length) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) event.preventDefault();
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className={cn(
          dropdownContentStyle,
          'fixed top-0 left-0 max-h-[calc(100dvh-24px)] overflow-y-auto text-gray-700 shadow-[0_8px_24px_rgba(15,23,42,0.12)]',
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function CalendarFieldPopover({
  label,
  displayValue,
  width,
  children,
}: CalendarFieldPopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const close = () => {
    setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${label}: ${displayValue}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen(!open)}
        className={cn(
          'focus-visible:outline-secondary-600 flex h-[25px] w-full items-center justify-between gap-1 rounded-[5px] border border-gray-300 bg-white px-1.5 text-[12px] leading-[17px] font-normal tracking-normal text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-2',
          open && 'border-secondary-600',
        )}
      >
        <span className="min-w-0 flex-1 truncate text-center">{displayValue}</span>
        <DropdownChevronIcon
          className={cn(
            'h-2.5 w-2.5 shrink-0 text-gray-400 transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {open && (
        <FieldPanel id={id} label={label} width={width} triggerRef={triggerRef} onClose={close}>
          {children(close)}
        </FieldPanel>
      )}
    </>
  );
}

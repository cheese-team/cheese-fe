'use client';

import { useId } from 'react';

import { Button } from '@/components/common/Button';
import BaseModal from '@/components/common/Modal/BaseModal';

import { cn } from '@/lib/cn';

type AuthConfirmModalProps = {
  isOpen: boolean;

  title: string;
  description?: string;

  primaryText: string;
  onPrimaryClick?: () => void;

  children?: React.ReactNode;
};

export default function AuthConfirmModal({
  isOpen,
  title,
  description,
  primaryText,
  onPrimaryClick,
  children,
}: AuthConfirmModalProps) {
  const titleId = useId();

  return (
    <BaseModal isOpen={isOpen} onClose={() => {}} hasOverlay closeOnEscape={false}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'bg-bg-white rounded-lg shadow-[0_0_4px_rgba(0,0,0,0.25)]',
          'w-[min(385px,calc(100vw-32px))]',
          'max-h-[calc(100dvh-160px)] md:max-h-[calc(100dvh-316px)]',
          'flex flex-col items-center gap-6 overflow-hidden',
          'px-[42.5px] py-10',
        )}
      >
        <div className="flex flex-col gap-3 text-center leading-6">
          <h2 id={titleId} className="text-[20px] font-bold tracking-normal text-gray-950">
            {title}
          </h2>

          {description ? (
            <p className="text-[20px] font-medium whitespace-pre-line text-gray-950">
              {description}
            </p>
          ) : null}

          {children ? <div className="w-full">{children}</div> : null}
        </div>

        <Button
          variant="light"
          onClick={onPrimaryClick}
          paddingX={20}
          className="w-fit text-[16px]"
        >
          {primaryText}
        </Button>
      </div>
    </BaseModal>
  );
}

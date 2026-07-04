'use client';

import { cn } from '@/lib/cn';
import { Button } from '@/components/common/Button';
import BaseModal from '@/components/common/Modal/BaseModal';

type AuthConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;

  title?: string;
  description?: string;

  primaryText: string;
  onPrimaryClick?: () => void;

  children?: React.ReactNode;
};

export default function AuthConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  primaryText,
  onPrimaryClick,
  children,
}: AuthConfirmModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} hasOverlay>
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'bg-bg-white rounded-lg shadow-[0_0_4px_rgba(0,0,0,0.25)]',
          'w-[min(385px,calc(100vw-32px))]',
          'max-h-[calc(100dvh-160px)] md:max-h-[calc(100dvh-316px)]',
          'flex flex-col overflow-hidden',
          'px-[42.5px] py-10',
        )}
      >
        <div className="flex flex-col items-center text-center">
          {title ? <h2 className="text-[20px] font-bold text-gray-950">{title}</h2> : null}
          {description ? (
            <p className={cn('text-[20px] font-normal text-gray-950', title && 'mt-3')}>
              {description}
            </p>
          ) : null}

          {children ? <div className="mt-[29px] w-full">{children}</div> : null}

          <div className="mt-6 w-full">
            <Button onClick={onPrimaryClick ?? onClose} paddingX={20} className="font-bold">
              {primaryText}
            </Button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

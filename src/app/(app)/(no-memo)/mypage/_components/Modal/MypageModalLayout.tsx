import { BaseModal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

import { cn } from '@/lib/cn';

import CloseIcon from '@/assets/icons/common/close.svg';

type MypageModalLayoutProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleClassName?: string;
  children: React.ReactNode;

  buttonText?: string;
  buttonClassName?: string;

  onConfirm?: () => void;
  submitFormId?: string;
};

export default function MypageModalLayout({
  isOpen,
  onClose,
  title,
  titleClassName,
  children,

  buttonText = '저장',
  buttonClassName,

  onConfirm,
  submitFormId,
}: MypageModalLayoutProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} hasOverlay>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-[393px] rounded-[10px] border border-gray-400 bg-white px-[26px] py-4"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="modal-title" className={cn('text-[14px] leading-5 font-bold', titleClassName)}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-5 w-5 items-center justify-center"
          >
            <CloseIcon className="h-2.5 w-2.5" />
          </button>
        </div>

        {children}

        <div className="mt-3 flex justify-end">
          <Button
            type={submitFormId ? 'submit' : 'button'}
            form={submitFormId}
            size={28}
            paddingX={12}
            className={cn('tracking-[-0.04em]', buttonClassName)}
            onClick={submitFormId ? undefined : onConfirm}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}

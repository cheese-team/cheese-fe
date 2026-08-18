'use client';

import CloseIcon from '@/assets/icons/common/close.svg';
import BaseModal from '@/components/common/Modal/BaseModal';
import TermsContent from './TermsContent';

type TermsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} hasOverlay>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
        className="bg-bg-white flex max-h-[75dvh] w-[min(640px,calc(100vw-32px))] flex-col gap-10 overflow-hidden px-10 py-[30px] shadow-[0_0_4px_rgba(0,0,0,0.25)]"
      >
        <div className="flex shrink-0 items-center justify-between">
          <div className="h-[30px] w-[30px] shrink-0" aria-hidden="true" />
          <h2 id="terms-modal-title" className="flex-1 text-center text-[24px] font-bold">
            치즈 이용약관
          </h2>

          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-label="이용약관 내용"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <TermsContent />
        </div>
      </div>
    </BaseModal>
  );
}

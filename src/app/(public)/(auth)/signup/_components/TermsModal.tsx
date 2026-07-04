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
        className="bg-bg-white flex max-h-[calc(100dvh-160px)] w-[min(640px,calc(100vw-32px))] flex-col overflow-hidden px-10 py-[30px] shadow-[0_0_4px_rgba(0,0,0,0.25)] sm:w-[min(630px,calc(100vw-48px))] md:max-h-[calc(100dvh-316px)]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 pb-10">
          <div className="h-6 w-6 shrink-0" aria-hidden="true" />
          <h2 id="terms-modal-title" className="flex-1 text-center text-[24px] font-bold">
            치즈 이용약관
          </h2>

          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <TermsContent />
        </div>
      </div>
    </BaseModal>
  );
}

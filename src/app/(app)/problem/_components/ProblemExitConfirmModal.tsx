'use client';

type ProblemExitConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndExit: () => void;
  onExitWithoutSave: () => void;
};

export default function ProblemExitConfirmModal({
  isOpen,
  onClose,
  onSaveAndExit,
  onExitWithoutSave,
}: ProblemExitConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="bg-overlay-dim fixed inset-0 z-[100] flex items-center justify-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="problem-exit-confirm-title"
        className="bg-bg-white relative flex h-[376px] w-[540px] flex-col items-center rounded-[12px] border border-gray-400 px-[32px] pt-[40px] pb-[36px] shadow-[0_4px_10px_rgba(0,0,0,0.25)]"
      >
        <button
          type="button"
          aria-label="닫기"
          className="absolute top-[20px] right-[32px] flex h-[24px] w-[24px] items-center justify-center text-[28px] leading-none font-light text-gray-700"
          onClick={onClose}
        >
          ×
        </button>

        <div className="bg-secondary-100 text-secondary-600 flex h-[80px] w-[80px] items-center justify-center rounded-full text-[48px] leading-none font-bold">
          ?
        </div>

        <h2
          id="problem-exit-confirm-title"
          className="mt-[20px] text-[24px] leading-[32px] font-bold"
        >
          진행도를 저장하고 나가시겠어요?
        </h2>

        <p className="mt-[12px] text-[14px] leading-[20px] font-medium text-gray-600">
          * 강제 종료하시면 진행도가 저장되지 않으니 주의하세요!
        </p>

        <div className="mt-[32px] flex items-center gap-[12px]">
          <button
            type="button"
            className="bg-secondary-600 flex h-[56px] w-[150px] items-center justify-center rounded-[10px] text-[16px] font-bold text-white"
            onClick={onSaveAndExit}
          >
            저장하고 나가기
          </button>

          <button
            type="button"
            className="flex h-[56px] w-[180px] items-center justify-center rounded-[10px] bg-gray-500 text-[16px] font-bold text-white"
            onClick={onExitWithoutSave}
          >
            저장하지 않고 나가기
          </button>
        </div>
      </section>
    </div>
  );
}

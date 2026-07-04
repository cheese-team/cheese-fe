'use client';

import MypageModalLayout from './MypageModalLayout';

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  titleClassName?: string;
  buttonText?: string;
  buttonClassName?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
  isOpen,
  title,
  description,
  titleClassName,
  buttonText,
  buttonClassName,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <MypageModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleClassName={titleClassName}
      buttonText={buttonText}
      buttonClassName={buttonClassName}
      onConfirm={onConfirm}
    >
      <p className="text-[12px] font-medium whitespace-pre-line">{description}</p>
    </MypageModalLayout>
  );
}

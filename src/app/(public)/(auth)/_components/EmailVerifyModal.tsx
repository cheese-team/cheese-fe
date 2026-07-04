import Image from 'next/image';
import { BaseModal } from '@/components/common/Modal';
import EmailVerifyForm, { EmailVerifyBaseProps } from './EmailVerifyForm';

type EmailVerifyPopupProps = EmailVerifyBaseProps & {
  isOpen: boolean;
  onClose: () => void;
};

export default function EmailVerifyModal({
  isOpen,
  onClose,
  title,
  description,
  onNext,
}: EmailVerifyPopupProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} hasOverlay>
      <div className="flex w-[457px] flex-col gap-10 rounded-[25px] bg-white px-14 py-10">
        <div>
          <Image src="/brands/cheese-logo.svg" alt="CHEESE" width={125} height={34} priority />
        </div>

        <EmailVerifyForm
          title={title}
          description={description}
          onNext={() => {
            onNext?.();
            onClose();
          }}
        />
      </div>
    </BaseModal>
  );
}

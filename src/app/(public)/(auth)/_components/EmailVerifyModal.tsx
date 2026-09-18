import Image from 'next/image';

import BaseModal from '@/components/common/Modal';
import EmailVerifyForm, { EmailVerifyBaseProps } from '../../_components/EmailVerifyForm';

import type { EmailVerificationPurpose } from '@/api/auth.api';

type EmailVerifyModalProps = Pick<EmailVerifyBaseProps, 'title' | 'description' | 'onNext'> & {
  isOpen: boolean;
  onClose: () => void;
  purpose: EmailVerificationPurpose;
};

export default function EmailVerifyModal({
  isOpen,
  onClose,
  title,
  description,
  purpose,
  onNext,
}: EmailVerifyModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} hasOverlay>
      <div className="flex w-[457px] flex-col gap-10 rounded-[25px] bg-white px-14 py-10">
        <div>
          <Image src="/brands/cheese-logo.svg" alt="CHEESE" width={125} height={34} priority />
        </div>

        <EmailVerifyForm
          title={title}
          description={description}
          purpose={purpose}
          onNext={(email) => {
            onNext(email);
            onClose();
          }}
        />
      </div>
    </BaseModal>
  );
}

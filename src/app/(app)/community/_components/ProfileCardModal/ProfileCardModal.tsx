import type { ReactNode } from 'react';

import BaseModal from '@/components/common/Modal';
import ProfileImage from '@/components/common/ProfileImage';
import { Button } from '@/components/common/Button';

import ProfileCardItem from './ProfileCardItem';

import { cn } from '@/lib/cn';

import CloseIcon from '@/assets/icons/common/close.svg';
import ContactIcon from '@/assets/icons/common/contact.svg';

import type { ProfileType } from '@/types/profile';

const PROFILE_TYPE_LABEL: Record<ProfileType, string> = {
  personal: '개인 회원',
  company: '기업 회원',
};

type ProfileItem = {
  label: string;
  value: ReactNode;
  valueClassName?: string;
};

type ProfileCardModalProps = {
  isOpen: boolean;
  onClose: () => void;

  profileType: ProfileType;
  name: string;
  email: string;
  profileImageUrl?: string;

  gradientClassName: string;
  profileItems: ProfileItem[];

  onContact: () => void;
};

export default function ProfileCardModal({
  isOpen,
  onClose,
  profileType,
  name,
  email,
  profileImageUrl,
  gradientClassName,
  profileItems,
  onContact,
}: ProfileCardModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} scope="content" hasOverlay>
      {/* 100vw - sidebar (260px) - modal horizontal margins (298px) */}
      <div className="w-[calc(100vw-558px)] max-w-[1362px] min-w-[720px] overflow-hidden rounded-[10px]">
        <div className="max-h-[901px] overflow-auto">
          <div className="bg-bg-2 flex w-full flex-col gap-6 px-10 py-13">
            <header className="flex items-center justify-between">
              <div className="h-[61px]">
                <h2 className="text-[24px] font-bold">{name} 님의 프로필</h2>
                <p className="text-[20px] font-medium text-gray-600">
                  {PROFILE_TYPE_LABEL[profileType]}
                </p>
              </div>

              <button type="button" onClick={onClose} aria-label="프로필 닫기">
                <CloseIcon className="m-[15px] h-[30px] text-gray-700" />
              </button>
            </header>

            <div className="overflow-hidden rounded-[10px]">
              <div className={cn('h-25 w-full bg-linear-to-r', gradientClassName)} />

              <section className="bg-bg-white flex flex-col gap-8 px-8 pt-8 pb-10">
                <section
                  className="flex items-center justify-between px-[6.8px]"
                  aria-label="프로필 정보"
                >
                  <div className="flex items-center gap-5">
                    <ProfileImage src={profileImageUrl} size={100} />

                    <div className="flex flex-col gap-3 font-medium">
                      <span className="text-[20px]">{name}</span>
                      <span className="text-gray-600">{email}</span>
                    </div>
                  </div>

                  <Button onClick={onContact} width={182} size={54} className="gap-3">
                    <ContactIcon className="h-[13px]" />
                    메시지 보내기
                  </Button>
                </section>

                <div className="grid grid-cols-2 gap-x-8 gap-y-5 max-xl:grid-cols-1">
                  {profileItems.map((item) => (
                    <ProfileCardItem
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      valueClassName={item.valueClassName}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

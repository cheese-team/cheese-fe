import { BaseModal } from '@/components/common/Modal';

import { ProfileImage } from '@/components/common/ProfileImage';
import { Button } from '@/components/common/Button';
import { DocumentLinkItem, DocumentLinkItemList } from '@/components/common/DocumentLink';
import { ProfileCardItem } from './ProfileCardItem';

import CloseIcon from '@/assets/icons/common/close.svg';
import ContactIcon from '@/assets/icons/common/contact.svg';
import FileIcon from '@/assets/icons/common/file.svg';

import { getOptionLabel } from '@/lib/getOptionLabel';
import { CONTACT_METHOD_OPTIONS } from '@/constants/profileOptions';

import type { PersonalProfile } from '@/types/profile';

type PersonalProfileCardProps = {
  isOpen: boolean;
  onClose: () => void;
  profile: PersonalProfile;
};

export default function PersonalProfileCard({
  isOpen,
  onClose,
  profile,
}: PersonalProfileCardProps) {
  const profileItems = [
    { label: '관심 직무', value: profile.interestedJob },
    {
      label: '자기소개서',
      value: (
        <DocumentLinkItem
          href={profile.coverLetter.url}
          label={profile.coverLetter.fileName}
          icon={<FileIcon type="file" />}
          labelClassName="text-gray-950 no-underline"
        />
      ),
    },
    { label: '내 스킬', value: profile.skills.join(', ') },
    { label: '관심 분야', value: profile.interests.join(', ') },
    {
      label: '이력서 및 기타문서',
      value: (
        <DocumentLinkItemList
          document={profile.additionalDocument}
          className="gap-2.5"
          labelClassName="text-gray-950 no-underline"
        />
      ),
      valueClassName: '',
    },
    {
      label: '선호 연락 방법',
      value: getOptionLabel(CONTACT_METHOD_OPTIONS, profile.contactMethod),
    },
  ];

  const handleContactClick = () => {
    if (profile.contactMethod === 'email') {
      window.location.href = `mailto:${profile.email}`;
      return;
    }

    window.open(profile.contactUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} hasOverlay>
      <div className="w-[calc(100vw-64px)] max-w-[1362px]">
        <div className="bg-bg-2 mx-auto flex w-full flex-col gap-6 px-10 py-13">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-[24px] font-bold">{profile.nickname} 님의 프로필</h2>
              <p className="text-[20px] font-medium text-gray-600">개인 회원</p>
            </div>

            <button type="button" onClick={onClose} aria-label="프로필 닫기">
              <CloseIcon className="m-[15px] h-[30px] text-gray-700" />
            </button>
          </header>

          <div className="overflow-hidden rounded-[10px]">
            <div className="h-25 w-full bg-linear-to-r from-[#B5D2F0] via-[#ECE8E9] to-[#FDF7E1]" />

            <section className="bg-bg-white flex flex-col gap-8 px-8 pt-8 pb-10">
              <section
                className="flex items-center justify-between px-[6.8px]"
                aria-label="프로필 정보"
              >
                <div className="flex items-center gap-5">
                  <ProfileImage src={profile.profileImageUrl} size={100} />
                  <div className="flex flex-col gap-3 font-medium">
                    <span className="text-[20px]">{profile.nickname}</span>
                    <span className="text-gray-600">{profile.email}</span>
                  </div>
                </div>

                <Button onClick={handleContactClick} width={182} size={54} className="gap-3">
                  <ContactIcon className="h-[13px]" />
                  메시지 보내기
                </Button>
              </section>

              <div className="grid grid-cols-2 gap-x-15 gap-y-6">
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
    </BaseModal>
  );
}

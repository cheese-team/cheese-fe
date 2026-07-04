import { BaseModal } from '@/components/common/Modal';

import { ProfileImage } from '@/components/common/ProfileImage';
import { Button } from '@/components/common/Button';
import { DocumentLinkItemList } from '@/components/common/DocumentLink';
import { ProfileCardItem } from './ProfileCardItem';

import CloseIcon from '@/assets/icons/common/close.svg';
import ContactIcon from '@/assets/icons/common/contact.svg';

import { getOptionLabel } from '@/lib/getOptionLabel';
import { CONTACT_METHOD_OPTIONS } from '@/constants/profileOptions';

import type { CompanyProfile } from '@/types/profile';

type CompanyProfileCardProps = {
  isOpen: boolean;
  onClose: () => void;
  profile: CompanyProfile;
};

export default function CompanyProfileCard({ isOpen, onClose, profile }: CompanyProfileCardProps) {
  const profileItems = [
    { label: '기업 구분', value: profile.companyType },
    { label: '대표자명', value: profile.representativeName },
    { label: '산업 구분', value: profile.industryType.join(', ') },
    { label: '사원 수', value: `${profile.employeeCount.toLocaleString()}명` },
    { label: '설립일', value: profile.foundedAt },
    {
      label: '선호 연락 방법',
      value: getOptionLabel(CONTACT_METHOD_OPTIONS, profile.contactMethod),
    },
    {
      label: '이력서 양식',
      value: (
        <DocumentLinkItemList
          document={profile.resumeTemplate}
          className="gap-2.5"
          labelClassName="text-gray-950 no-underline"
        />
      ),
      valueClassName: '',
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
              <p className="text-[20px] font-medium text-gray-600">기업 회원</p>
            </div>

            <button type="button" onClick={onClose} aria-label="프로필 닫기">
              <CloseIcon className="m-[15px] h-[30px] text-gray-700" />
            </button>
          </header>

          <div className="overflow-hidden rounded-[10px]">
            <div className="h-25 w-full bg-linear-to-r from-[#DBC0E4] via-[#DDD6D7] to-[#DFECCB]" />

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

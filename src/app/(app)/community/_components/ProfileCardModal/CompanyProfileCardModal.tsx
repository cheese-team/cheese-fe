import { DocumentLinkItemList } from '@/components/common/DocumentLink';

import ProfileCardModal from './ProfileCardModal';

import { getOptionLabel } from '@/lib/getOptionLabel';

import { CONTACT_METHOD_OPTIONS } from '@/constants/profileOptions';

import type { CompanyProfile } from '@/types/profile';

type CompanyProfileCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  profile: CompanyProfile;
};

export default function CompanyProfileCardModal({
  isOpen,
  onClose,
  profile,
}: CompanyProfileCardModalProps) {
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
          urlLabel={`${profile.companyName} 홈페이지 URL`}
          className="gap-2.5"
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
    <ProfileCardModal
      isOpen={isOpen}
      onClose={onClose}
      profileType="company"
      name={profile.companyName}
      email={profile.email}
      profileImageUrl={profile.profileImageUrl}
      gradientClassName="from-[#DBC0E4] via-[#DDD6D7] to-[#DFECCB]"
      profileItems={profileItems}
      onContact={handleContactClick}
    />
  );
}

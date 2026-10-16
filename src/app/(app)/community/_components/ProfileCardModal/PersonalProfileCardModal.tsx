import { DocumentLinkItemList } from '@/components/common/DocumentLink';

import ProfileCardModal from './ProfileCardModal';

import { getOptionLabel } from '@/lib/getOptionLabel';

import { CONTACT_METHOD_OPTIONS } from '@/constants/profileOptions';

import type { PublicPersonalProfile } from '@/api/users.api';

type PersonalProfileCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  profile: PublicPersonalProfile;
};

export default function PersonalProfileCardModal({
  isOpen,
  onClose,
  profile,
}: PersonalProfileCardModalProps) {
  const profileItems = [
    { label: '관심 직무', value: profile.interestedJob },
    {
      label: '자기소개서',
      value: (
        <DocumentLinkItemList
          document={profile.coverLetter ?? { fileName: '', url: '' }}
          urlLabel={profile.coverLetter?.urlLabel || '자기소개서 URL'}
          labelClassName="text-gray-950 no-underline"
        />
      ),
    },
    { label: '내 스킬', value: (profile.skills ?? []).join(', ') },
    { label: '관심 분야', value: (profile.interests ?? []).join(', ') },
    {
      label: '이력서 및 기타문서',
      value: (
        <DocumentLinkItemList
          document={profile.additionalDocument ?? { fileName: '', url: '' }}
          urlLabel={profile.additionalDocument?.urlLabel || '포트폴리오 URL'}
          className="gap-2.5"
        />
      ),
      valueClassName: '',
    },
    {
      label: '선호 연락 방법',
      value: profile.contactMethod
        ? getOptionLabel(CONTACT_METHOD_OPTIONS, profile.contactMethod)
        : '-',
    },
  ];

  const handleContactClick = () => {
    if (profile.contactMethod === 'email' && profile.email) {
      window.location.href = `mailto:${profile.email}`;
      return;
    }

    if (profile.contactMethod && profile.contactMethod !== 'email' && profile.contactUrl) {
      window.open(profile.contactUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <ProfileCardModal
      isOpen={isOpen}
      onClose={onClose}
      profileType="personal"
      name={profile.nickname || '이름 미등록'}
      email={profile.email ?? ''}
      profileImageUrl={profile.profileImageUrl}
      gradientClassName="from-[#B5D2F0] via-[#ECE8E9] to-[#FDF7E1]"
      profileItems={profileItems}
      onContact={handleContactClick}
      contactDisabled={
        !profile.contactMethod ||
        !(profile.contactMethod === 'email' ? profile.email : profile.contactUrl)
      }
    />
  );
}

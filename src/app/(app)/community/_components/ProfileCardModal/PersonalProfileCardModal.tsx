import { DocumentLinkItem, DocumentLinkItemList } from '@/components/common/DocumentLink';

import ProfileCardModal from './ProfileCardModal';

import { getOptionLabel } from '@/lib/getOptionLabel';

import { CONTACT_METHOD_OPTIONS } from '@/constants/profileOptions';

import FileIcon from '@/assets/icons/common/file.svg';

import type { PersonalProfile } from '@/types/profile';

type PersonalProfileCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  profile: PersonalProfile;
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
          urlLabel={`${profile.nickname} 포트폴리오 URL`}
          className="gap-2.5"
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
    <ProfileCardModal
      isOpen={isOpen}
      onClose={onClose}
      profileType="personal"
      name={profile.nickname}
      email={profile.email}
      profileImageUrl={profile.profileImageUrl}
      gradientClassName="from-[#B5D2F0] via-[#ECE8E9] to-[#FDF7E1]"
      profileItems={profileItems}
      onContact={handleContactClick}
    />
  );
}

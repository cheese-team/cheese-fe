import type { Ref } from 'react';

import { DocumentLinkItemList } from '@/components/common/DocumentLink';

import ProfileCardModal from './ProfileCardModal';

import { getOptionLabel } from '@/lib/getOptionLabel';
import { getPublicProfileContactHref } from './publicProfileModel';

import { CONTACT_METHOD_OPTIONS } from '@/constants/profileOptions';

import type { PublicPersonalProfile } from '@/api/users.api';

type PersonalProfileCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  dialogRef?: Ref<HTMLDivElement>;
  profile: PublicPersonalProfile;
};

/** 공통 카드에 개인 회원의 관심 직무, 자기소개서와 이력서 등 공개 항목을 표시한다. */
export default function PersonalProfileCardModal({
  isOpen,
  onClose,
  dialogRef,
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

  const contactHref = getPublicProfileContactHref(profile);

  /** 이메일은 메일 앱에 전달하고, 오픈채팅과 구글 폼은 새 탭에서 연다. */
  const handleContactClick = () => {
    if (!contactHref) return;

    if (profile.contactMethod === 'email') {
      window.location.href = contactHref;
      return;
    }

    window.open(contactHref, '_blank', 'noopener,noreferrer');
  };

  return (
    <ProfileCardModal
      dialogRef={dialogRef}
      isOpen={isOpen}
      onClose={onClose}
      profileType="personal"
      name={profile.nickname || '이름 미등록'}
      email={profile.email ?? ''}
      profileImageUrl={profile.profileImageUrl}
      gradientClassName="from-[#B5D2F0] via-[#ECE8E9] to-[#FDF7E1]"
      profileItems={profileItems}
      onContact={handleContactClick}
      contactDisabled={!contactHref}
    />
  );
}

import { DocumentLinkItem, DocumentLinkItemList } from '@/components/common/DocumentLink';
import FileIcon from '@/assets/icons/common/file.svg';
import LinkIcon from '@/assets/icons/common/link.svg';

import ProfileCardModal from './ProfileCardModal';

import { getOptionLabel } from '@/lib/getOptionLabel';

import { CONTACT_METHOD_OPTIONS } from '@/constants/profileOptions';

import type { PublicCompanyProfile } from '@/api/users.api';

type CompanyProfileCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  profile: PublicCompanyProfile;
};

export default function CompanyProfileCardModal({
  isOpen,
  onClose,
  profile,
}: CompanyProfileCardModalProps) {
  const profileItems = [
    { label: '기업 구분', value: profile.companyType },
    { label: '대표자명', value: profile.representativeName },
    { label: '산업 구분', value: (profile.industryType ?? []).join(', ') },
    {
      label: '사원 수',
      value: profile.employeeCount == null ? '-' : `${profile.employeeCount.toLocaleString()}명`,
    },
    { label: '설립일', value: profile.foundedAt },
    {
      label: '선호 연락 방법',
      value: profile.contactMethod
        ? getOptionLabel(CONTACT_METHOD_OPTIONS, profile.contactMethod)
        : '-',
    },
    {
      label: '이력서 양식 및 기업 홈페이지',
      value: profile.resumeTemplate ? (
        <DocumentLinkItemList document={profile.resumeTemplate} className="gap-2.5" />
      ) : (
        '-'
      ),
      valueClassName: '',
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
      profileType="company"
      name={profile.companyName || '기업명 미등록'}
      email={profile.email ?? ''}
      profileImageUrl={profile.profileImageUrl}
      gradientClassName="from-[#DBC0E4] via-[#DDD6D7] to-[#DFECCB]"
      profileItems={profileItems}
      onContact={handleContactClick}
      contactDisabled={
        !profile.contactMethod ||
        !(profile.contactMethod === 'email' ? profile.email : profile.contactUrl)
      }
    />
  );
}

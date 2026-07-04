'use client';

import PersonalProfileCard from '@/app/(app)/community/_components/ProfileCard/PersonalProfileCard';
import CompanyProfileCard from '@/app/(app)/community/_components/ProfileCard/CompanyProfileCard';
import { Button } from '@/components/common/Button';
import { ProfileImage } from '@/components/common/ProfileImage';
import { useState } from 'react';
import { UserSummary } from '@/types/community';
import { getMockCompanyProfile, getMockPersonalProfile } from '@/mocks/profile/userProfiles';

type PostDetailAsideProfileProps = {
  author: UserSummary;
};

export function PostDetailAsideProfile({ author }: PostDetailAsideProfileProps) {
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);

  const isPersonalProfile = author.type === 'personal';
  // const ProfileCardModal = isPersonalProfile ? PersonalProfileCard : CompanyProfileCard;

  const handleProfileButtonClick = () => {
    setIsProfileCardOpen(true);
  };

  return (
    <div className="flex w-full flex-col items-center gap-4 py-10">
      <div className="flex flex-col items-center gap-3">
        <ProfileImage size={100} src={author.profileImageUrl} />

        <div className="flex flex-col gap-1 text-center leading-[30px]">
          <span className="text-[20px] font-bold break-words">{author.nickname}</span>
          <span className="break-all">{author.email}</span>
        </div>
      </div>

      <Button
        onClick={handleProfileButtonClick}
        fullWidth
        variant="outlineGray"
        className="border-gray-400"
        size={44}
      >
        {/* TODO: 기업 프로필 모달 열기 */}
        {author.type === 'personal' ? '프로필 보기' : '기업 정보 알아보기'}
      </Button>

      {isPersonalProfile ? (
        <PersonalProfileCard
          isOpen={isProfileCardOpen}
          onClose={() => setIsProfileCardOpen(false)}
          profile={getMockPersonalProfile(author.id)}
        />
      ) : (
        <CompanyProfileCard
          isOpen={isProfileCardOpen}
          onClose={() => setIsProfileCardOpen(false)}
          profile={getMockCompanyProfile(author.id)}
        />
      )}
    </div>
  );
}

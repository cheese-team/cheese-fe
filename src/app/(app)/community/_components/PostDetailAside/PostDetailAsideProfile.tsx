'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';
import ProfileImage from '@/components/common/ProfileImage';

import { CompanyProfileCardModal, PersonalProfileCardModal } from '../ProfileCardModal';

import type { CommunityAuthor, UserSummary } from '@/types/community/community';

import { getMockCompanyProfile, getMockPersonalProfile } from '@/mocks/profile/userProfiles';

type PostDetailAsideProfileProps = {
  author: UserSummary | CommunityAuthor;
};

export default function PostDetailAsideProfile({ author }: PostDetailAsideProfileProps) {
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);

  const isPersonalProfile = author.profileType === 'personal';

  const handleProfileButtonClick = () => {
    setIsProfileCardOpen(true);
  };

  return (
    <div className="flex w-full flex-col items-center gap-4 py-10">
      <div className="flex flex-col items-center gap-3">
        <ProfileImage size={100} src={author.profileImageUrl} />

        <div className="flex flex-col gap-1 text-center leading-[30px]">
          <span className="text-[20px] font-bold break-words">
            {'displayName' in author ? author.displayName : author.nickname}
          </span>
          <span className="break-all">{author.email}</span>
        </div>
      </div>

      <Button
        disabled={'userId' in author}
        title={'userId' in author ? '작성자 상세 프로필 API 연동 준비 중입니다.' : undefined}
        onClick={handleProfileButtonClick}
        fullWidth
        variant="outlineGray"
        className="border-gray-400"
        size={44}
      >
        {author.profileType === 'personal' ? '프로필 보기' : '기업 정보 알아보기'}
      </Button>

      {'id' in author &&
        (isPersonalProfile ? (
          <PersonalProfileCardModal
            isOpen={isProfileCardOpen}
            onClose={() => setIsProfileCardOpen(false)}
            profile={getMockPersonalProfile(author.id)}
          />
        ) : (
          <CompanyProfileCardModal
            isOpen={isProfileCardOpen}
            onClose={() => setIsProfileCardOpen(false)}
            profile={getMockCompanyProfile(author.id)}
          />
        ))}
    </div>
  );
}

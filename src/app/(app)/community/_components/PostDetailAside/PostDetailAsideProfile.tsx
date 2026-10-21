'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';
import ProfileImage from '@/components/common/ProfileImage';

import PublicProfileCardModal from '../ProfileCardModal/PublicProfileCardModal';

import type { CommunityAuthor, UserSummary } from '@/types/community/community';

type PostDetailAsideProfileProps = {
  author: UserSummary | CommunityAuthor;
};

export default function PostDetailAsideProfile({ author }: PostDetailAsideProfileProps) {
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);

  const userId = 'userId' in author ? author.userId : undefined;

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
        disabled={!userId}
        title={!userId ? '작성자 사용자 ID를 확인할 수 없습니다.' : undefined}
        onClick={handleProfileButtonClick}
        fullWidth
        variant="outlineGray"
        className="border-gray-400"
        size={44}
      >
        {author.profileType === 'company' ? '기업 정보 알아보기' : '프로필 보기'}
      </Button>

      <PublicProfileCardModal
        key={userId}
        userId={userId}
        isOpen={isProfileCardOpen}
        onClose={() => setIsProfileCardOpen(false)}
      />
    </div>
  );
}

'use client';

import { useRef } from 'react';

import { ProfileImage } from '@/components/common/ProfileImage';
import { Button } from '@/components/common/Button';

import { getMockPersonalProfile } from '@/mocks/profile/userProfiles';
import { resizeTextarea } from './utils';

import type { CommentFormProps } from './types';

export default function CommentForm({ value, onValueChange, onSubmit }: CommentFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const personalProfile = getMockPersonalProfile(1);

  const handleSubmit = () => {
    onSubmit();

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = '30px';
      }
    });
  };

  return (
    <div className="flex gap-3">
      <ProfileImage size={40} src={personalProfile.profileImageUrl} />

      <div className="focus-within:border-secondary-600 flex w-full items-center gap-2.5 border-b border-gray-400 pb-3 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value);
            resizeTextarea(e.target);
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="댓글 등록"
          rows={1}
          className="h-[30px] max-h-60 w-full resize-none overflow-y-auto pt-1 outline-none"
        />

        <Button onClick={handleSubmit} width={56} size={36}>
          등록
        </Button>
      </div>
    </div>
  );
}

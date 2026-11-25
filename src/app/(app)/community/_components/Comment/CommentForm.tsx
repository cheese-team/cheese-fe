'use client';

import { useEffect, useRef } from 'react';

import ProfileImage from '@/components/common/ProfileImage';
import { Button } from '@/components/common/Button';

import { resizeTextarea } from './utils';

import type { CommentFormProps } from './types';

export default function CommentForm({
  value,
  onValueChange,
  onSubmit,
  disabled = false,
  profileImageUrl,
  isReply = false,
  textareaRef: externalTextareaRef,
}: CommentFormProps) {
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalTextareaRef ?? internalTextareaRef;

  useEffect(() => {
    if (!value && textareaRef.current) {
      textareaRef.current.style.height = '30px';
    }
  }, [value, textareaRef]);

  const handleSubmit = () => {
    if (disabled || !value.trim()) return;
    onSubmit();
  };

  return (
    <div className="flex gap-3">
      <ProfileImage size={40} src={profileImageUrl} />

      <div className="focus-within:border-secondary-600 flex w-full items-center gap-2.5 border-b border-gray-400 pb-3 transition-colors">
        <textarea
          disabled={disabled}
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
          aria-label={isReply ? '답글 입력' : '댓글 입력'}
          placeholder="댓글을 추가해보세요"
          rows={1}
          className="h-[30px] max-h-60 w-full resize-none overflow-y-auto pt-1 outline-none"
        />

        <Button disabled={disabled || !value.trim()} onClick={handleSubmit} width={56} size={36}>
          등록
        </Button>
      </div>
    </div>
  );
}

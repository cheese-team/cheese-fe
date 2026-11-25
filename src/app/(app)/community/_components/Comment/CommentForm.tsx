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
  onCancel,
  disabled = false,
  profileImageUrl,
  displayName,
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
    if (disabled) return;

    if (!value.trim()) {
      window.alert('댓글 내용을 입력하지 않았습니다');
      textareaRef.current?.focus();
      return;
    }

    onSubmit();
  };

  return (
    <div className="focus-within:border-secondary-600 flex flex-col gap-3 rounded-[10px] border border-gray-400 px-4 py-3 transition-colors">
      <div className="flex items-center gap-2">
        <ProfileImage size={30} src={profileImageUrl} />
        <h3 className="leading-5 font-medium">{displayName}</h3>
      </div>

      <div className="flex w-full items-center gap-2.5">
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
          placeholder={isReply ? '답글을 추가해보세요' : '댓글을 추가해보세요'}
          rows={1}
          className="h-[30px] max-h-60 w-full resize-none overflow-y-auto outline-none"
        />
      </div>

      <div className="flex gap-2 self-end">
        {isReply && (
          <Button
            disabled={disabled}
            onClick={onCancel}
            variant="outlineLightGray"
            width={48}
            size={36}
            className="text-gray-500 hover:border-gray-400 hover:bg-gray-400 hover:text-gray-700"
          >
            취소
          </Button>
        )}

        <Button
          disabled={disabled}
          onClick={handleSubmit}
          variant="outlinePrimary"
          width={48}
          size={36}
          className="text-secondary-800 hover:bg-secondary-600 text-[14px] hover:text-gray-50"
        >
          등록
        </Button>
      </div>
    </div>
  );
}

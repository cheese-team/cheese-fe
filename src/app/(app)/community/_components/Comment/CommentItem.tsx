import { useRef } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import ProfileImage from '@/components/common/ProfileImage';
import { Button } from '@/components/common/Button';

import {
  dropdownContentStyle,
  dropdownOptionStyle,
  dropdownOptionInteractiveStyle,
} from '@/components/common/styles/dropdown';

import { cn } from '@/lib/cn';

import { resizeTextarea } from './utils';

import MoreIcon from '@/assets/icons/common/more.svg';

import type { CommentItemProps } from './types';

export default function CommentItem({
  disabled = false,
  comment,
  isMine,
  isEditing,
  editingValue,
  textareaRef,
  onStartEdit,
  onChangeEditingValue,
  onUpdate,
  onCancelEdit,
  onDelete,
}: CommentItemProps) {
  const focusEditorOnCloseRef = useRef(false);
  const optionClassName = cn(
    dropdownOptionStyle,
    !disabled && dropdownOptionInteractiveStyle,
    'data-[highlighted]:bg-gray-200 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
  );
  return (
    <li key={comment.id} className="relative flex items-start gap-3">
      <div className="p-[5px]">
        <ProfileImage size={30} src={comment.author.profileImageUrl} />
      </div>

      <div className="flex w-full gap-2.5">
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="font-medium">{comment.author.displayName}</h3>

          {isEditing ? (
            <div className="flex flex-col gap-3">
              <textarea
                disabled={disabled}
                ref={textareaRef}
                value={editingValue}
                onChange={(e) => {
                  onChangeEditingValue(e.target.value);
                  resizeTextarea(e.target, 80);
                }}
                onKeyDown={(e) => {
                  if (!disabled && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    onUpdate(comment.id);
                  }
                }}
                className="focus:outline-secondary-600 max-h-60 min-h-20 resize-none overflow-y-auto rounded-[5px] border border-gray-400 px-2 py-2"
              />

              <div className="flex gap-1 self-end">
                <Button
                  disabled={disabled}
                  onClick={onCancelEdit}
                  width={56}
                  size={36}
                  variant="gray"
                >
                  취소
                </Button>

                <Button
                  onClick={() => onUpdate(comment.id)}
                  width={56}
                  size={36}
                  disabled={disabled}
                >
                  수정
                </Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-line">{comment.content}</p>
          )}
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-label="댓글 더보기"
              className="mt-4 flex w-[33px] shrink-0 justify-center self-start"
            >
              <MoreIcon className="h-3" aria-hidden="true" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              side="left"
              align="start"
              alignOffset={-8}
              className={cn(dropdownContentStyle, 'z-[60] flex w-25 flex-col gap-2')}
              onCloseAutoFocus={(event) => {
                if (focusEditorOnCloseRef.current) {
                  event.preventDefault();
                  focusEditorOnCloseRef.current = false;
                  textareaRef.current?.focus();
                }
              }}
            >
              {isMine ? (
                <>
                  <DropdownMenu.Item
                    disabled={disabled}
                    className={optionClassName}
                    onSelect={() => {
                      focusEditorOnCloseRef.current = true;
                      onStartEdit(comment);
                    }}
                  >
                    수정
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    disabled={disabled}
                    className={optionClassName}
                    onSelect={() => onDelete(comment.id)}
                  >
                    삭제
                  </DropdownMenu.Item>
                </>
              ) : (
                // TODO: 신고 모달 연결
                <DropdownMenu.Item disabled={disabled} className={optionClassName}>
                  신고
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </li>
  );
}

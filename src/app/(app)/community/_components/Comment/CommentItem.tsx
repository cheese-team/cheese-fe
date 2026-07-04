import { ProfileImage } from '@/components/common/ProfileImage';
import { Button } from '@/components/common/Button';

import { resizeTextarea } from './utils';

import MoreIcon from '@/assets/icons/common/more.svg';

import type { CommentItemProps } from './types';

export default function CommentItem({
  comment,
  isMine,
  isEditing,
  isMenuOpen,
  editingValue,
  textareaRef,
  onToggleMenu,
  onStartEdit,
  onChangeEditingValue,
  onUpdate,
  onCancelEdit,
  onDelete,
}: CommentItemProps) {
  return (
    <li key={comment.id} className="relative flex items-start gap-3">
      <div className="p-[5px]">
        <ProfileImage size={30} src={comment.author.profileImageUrl} />
      </div>

      <div className="flex w-full gap-2.5">
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="font-medium">{comment.author.nickname}</h3>

          {isEditing ? (
            <div className="flex flex-col gap-3 rounded-[5px] border border-gray-400 px-3 py-3">
              <textarea
                ref={textareaRef}
                value={editingValue}
                onChange={(e) => {
                  onChangeEditingValue(e.target.value);
                  resizeTextarea(e.target, 80);
                }}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    onUpdate(comment.id);
                  }
                }}
                className="focus:outline-secondary-600 max-h-60 min-h-20 resize-none overflow-y-auto px-2 py-2"
              />

              <div className="flex gap-1 self-end">
                <Button onClick={onCancelEdit} width={56} size={36} variant="gray">
                  취소
                </Button>

                <Button onClick={() => onUpdate(comment.id)} width={56} size={36}>
                  수정
                </Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-line">{comment.content}</p>
          )}
        </div>

        <button
          type="button"
          className="mt-4 flex w-[33px] justify-center"
          onClick={() => onToggleMenu(comment.id)}
        >
          <MoreIcon className="h-3" />
        </button>
      </div>

      {/* TODO: 공통 드롭다운 교체 예정 */}
      {isMenuOpen && (
        <div className="bg-bg-white absolute top-2 right-8 z-10 flex w-25 flex-col gap-2 rounded-[10px] border border-gray-400 py-3 text-[12px] leading-5">
          {isMine ? (
            <>
              <button
                type="button"
                className="mx-3 rounded-[5px] px-2 text-left hover:bg-gray-200"
                onClick={() => onStartEdit(comment)}
              >
                수정
              </button>
              <button
                type="button"
                className="mx-3 rounded-[5px] px-2 text-left hover:bg-gray-200"
                onClick={() => onDelete(comment.id)}
              >
                삭제
              </button>
            </>
          ) : (
            <button type="button" className="mx-3 rounded-[5px] px-2 text-left hover:bg-gray-200">
              신고
            </button>
          )}
        </div>
      )}
    </li>
  );
}

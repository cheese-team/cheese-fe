'use client';

import { useEffect, useId, useRef, useState } from 'react';

import DeleteIcon from '@/assets/icons/sidebar/delete.svg';
import MessageIcon from '@/assets/icons/sidebar/message.svg';
import { cn } from '@/lib/cn';

type NotificationActionsProps = {
  isRead: boolean;
  disabled: boolean;
  onRead: () => void;
  onDelete: () => Promise<boolean>;
};

const actionClassName =
  'flex h-[24px] w-[24px] items-center justify-center rounded-[4px] text-gray-500 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-secondary-600 disabled:cursor-not-allowed disabled:text-gray-300';

export function NotificationActions({
  isRead,
  disabled,
  onRead,
  onDelete,
}: NotificationActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmId = useId();
  const deleteButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirmOpen) cancelButton.current?.focus({ preventScroll: true });
  }, [confirmOpen]);

  const closeConfirmation = () => {
    setConfirmOpen(false);
    deleteButton.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <div
        className={cn(
          'absolute top-[8px] right-0 z-10 flex items-center gap-[4px] rounded-[5px] border border-gray-400 bg-gray-50 p-[4px]',
          !confirmOpen &&
            'pointer-events-none opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100 max-md:pointer-events-auto max-md:opacity-100',
        )}
      >
        <button
          type="button"
          onClick={onRead}
          disabled={disabled || isRead}
          aria-label="알림 읽음 처리"
          title={isRead ? '이미 읽은 알림' : '읽음 처리'}
          className={actionClassName}
        >
          <MessageIcon aria-hidden="true" className="h-[12px] w-[14px]" />
        </button>
        <button
          ref={deleteButton}
          type="button"
          onClick={() => setConfirmOpen((open) => !open)}
          disabled={disabled}
          aria-label="알림 삭제"
          title="삭제"
          aria-expanded={confirmOpen}
          aria-controls={confirmId}
          className={actionClassName}
        >
          <DeleteIcon aria-hidden="true" className="h-[12px] w-[11px]" />
        </button>
      </div>
      {confirmOpen ? (
        <div
          id={confirmId}
          role="group"
          aria-label="알림 삭제 확인"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && !disabled) {
              event.stopPropagation();
              closeConfirmation();
            }
          }}
          className="mt-[12px] flex flex-col gap-[8px] rounded-[5px] border border-gray-300 p-[12px]"
        >
          <p className="text-[12px] leading-[20px] text-gray-700">
            삭제하면 복구할 수 없습니다. 정말 삭제하시겠습니까?
          </p>
          <div className="flex justify-end gap-[8px]">
            <button
              ref={cancelButton}
              type="button"
              disabled={disabled}
              onClick={closeConfirmation}
              className="rounded-[4px] border border-gray-300 px-[12px] py-[4px] text-[12px] disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={async () => {
                if (await onDelete()) setConfirmOpen(false);
              }}
              className="bg-secondary-600 rounded-[4px] px-[12px] py-[4px] text-[12px] text-white disabled:opacity-50"
            >
              삭제하기
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

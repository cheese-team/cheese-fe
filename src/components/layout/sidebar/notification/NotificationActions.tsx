'use client';

import { useEffect, useId, useRef, useState } from 'react';

import DeleteIcon from '@/assets/icons/sidebar/delete.svg';
import MessageIcon from '@/assets/icons/sidebar/message.svg';
import SendIcon from '@/assets/icons/sidebar/send.svg';
import {
  dropdownOptionStyle,
  dropdownOptionInteractiveStyle,
} from '@/components/common/styles/dropdown';
import { cn } from '@/lib/cn';
import { NotificationContact } from './NotificationContact';

type NotificationActionsProps = {
  isRead: boolean;
  disabled: boolean;
  onRead: () => void;
  onDelete: () => Promise<boolean>;
  viewerId: string;
  senderId: string;
};

const actionClassName =
  'flex h-[24px] w-[24px] items-center justify-center rounded-[4px] text-gray-500 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-secondary-600 disabled:cursor-not-allowed disabled:text-gray-300';

export function NotificationActions({
  isRead,
  disabled,
  onRead,
  onDelete,
  viewerId,
  senderId,
}: NotificationActionsProps) {
  const [openPanel, setOpenPanel] = useState<'delete' | 'contact' | null>(null);
  const panelId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const contactButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!openPanel) return;
    if (openPanel === 'delete') cancelButton.current?.focus({ preventScroll: true });
    const onOutsidePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target))
        setOpenPanel(null);
    };
    document.addEventListener('pointerdown', onOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', onOutsidePointerDown);
  }, [openPanel]);

  const closePanel = () => {
    const trigger = openPanel === 'delete' ? deleteButton.current : contactButton.current;
    setOpenPanel(null);
    requestAnimationFrame(() => {
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    });
  };

  return (
    <div
      ref={menuRef}
      className={cn('absolute top-[12px] right-0', openPanel ? 'z-30' : 'z-20')}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && openPanel) {
          event.stopPropagation();
          closePanel();
        }
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          setOpenPanel(null);
      }}
    >
      <div
        className={cn(
          'flex items-center gap-[4px] rounded-[5px] bg-gray-50 p-[4px] ring-1 ring-gray-400 ring-inset',
          !openPanel &&
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
          <MessageIcon aria-hidden="true" className="block shrink-0" />
        </button>
        <button
          ref={deleteButton}
          type="button"
          onClick={() => setOpenPanel((panel) => (panel === 'delete' ? null : 'delete'))}
          disabled={disabled}
          aria-label="알림 삭제"
          title="삭제"
          aria-expanded={openPanel === 'delete'}
          aria-controls={openPanel === 'delete' ? panelId : undefined}
          className={actionClassName}
        >
          <DeleteIcon aria-hidden="true" className="block shrink-0" />
        </button>
        <button
          ref={contactButton}
          type="button"
          onClick={() => setOpenPanel((panel) => (panel === 'contact' ? null : 'contact'))}
          disabled={disabled || !senderId}
          aria-label="연락 방법 보기"
          title={senderId ? '상대가 지정한 연락 방법' : '발신자가 없는 알림입니다'}
          aria-expanded={openPanel === 'contact'}
          aria-controls={openPanel === 'contact' ? panelId : undefined}
          className={actionClassName}
        >
          <SendIcon aria-hidden="true" className="block shrink-0" />
        </button>
      </div>
      {openPanel === 'delete' ? (
        <div
          id={panelId}
          role="group"
          aria-label="알림 삭제 확인"
          className="absolute top-[40px] right-0 flex h-[120px] w-[157px] flex-col gap-[8px] overflow-hidden rounded-[5px] bg-gray-50 p-[12px] ring-1 ring-gray-400 ring-inset"
        >
          <p className="text-[12px] leading-[20px] font-medium whitespace-nowrap text-gray-700">
            <span className="block">삭제하면 복구할 수 없습니다.</span>
            <span className="block">정말 삭제하시겠습니까?</span>
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={async () => {
              if (await onDelete()) {
                setOpenPanel(null);
              } else {
                requestAnimationFrame(() => {
                  if (document.activeElement === document.body)
                    cancelButton.current?.focus({ preventScroll: true });
                });
              }
            }}
            className={cn(
              dropdownOptionStyle,
              dropdownOptionInteractiveStyle,
              'shrink-0 text-gray-950 disabled:cursor-wait disabled:opacity-50',
            )}
          >
            네
          </button>
          <button
            ref={cancelButton}
            type="button"
            disabled={disabled}
            onClick={closePanel}
            className={cn(
              dropdownOptionStyle,
              dropdownOptionInteractiveStyle,
              'shrink-0 text-gray-950 disabled:cursor-wait disabled:opacity-50',
            )}
          >
            아니오
          </button>
        </div>
      ) : null}
      {openPanel === 'contact' && senderId ? (
        <div
          id={panelId}
          role="region"
          aria-label="발신자 연락 방법"
          className="absolute top-[40px] right-0 w-[220px] rounded-[5px] bg-gray-50 p-[12px] text-[12px] leading-[20px] text-gray-700 ring-1 ring-gray-400 ring-inset"
        >
          <NotificationContact
            viewerId={viewerId}
            senderId={senderId}
            onRetryStart={() => contactButton.current?.focus({ preventScroll: true })}
          />
        </div>
      ) : null}
    </div>
  );
}

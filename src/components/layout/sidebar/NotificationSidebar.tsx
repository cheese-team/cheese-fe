'use client';

import { useState, type MouseEvent } from 'react';

import Image from 'next/image';

import DoubleArrowIcon from '@/assets/icons/problem/double-arrow.svg';
import DeleteIcon from '@/assets/icons/sidebar/delete.svg';
import MessageIcon from '@/assets/icons/sidebar/message.svg';
import SendIcon from '@/assets/icons/sidebar/send.svg';

type NotificationItem = {
  id: string;
  sender: string;
  message: string;
  category: string;
  content: string;
  date: string;
  unread?: boolean;
  avatarSrc?: string;
  avatarClassName?: string;
};

type NotificationSidebarProps = {
  onClose: () => void;
};

const recentNotifications: NotificationItem[] = [
  {
    id: 'recent-1',
    sender: '유혹천',
    message: ' 님이 지원했습니다',
    category: '그룹모집',
    content:
      '이곳저곳 널리 퍼져있는 디지털을 한 눈에 편리하게 볼 수 있는 베이커리 플랫폼 프로젝트입니다. 함께하실 기획자 모집합니다! 😊 건강 디저트 e-커머스 건강 디저트 좋아하시는 분 계신가요~? 건강 디저트 덕후들의 다양한 불편/불만 사항을 고려하여 기획한 건강 디저트 프로젝트입니다 핵심 비전을 이끌어 내주실 역량 보유자들을 기다립니다!',
    date: '2월 10일',
    unread: true,
    avatarSrc: '/mock/profile-1.png',
  },
  {
    id: 'recent-2',
    sender: '치즈공장',
    message: ' 님이 지원했습니다',
    category: '채용공고',
    content: '텍스트로 시간 표시...',
    date: '2월 10일',
    unread: true,
    avatarClassName: 'bg-error-subtle',
  },
  {
    id: 'recent-3',
    sender: '치즈',
    message: ' 새로운 업데이트가 있습니다',
    category: '업데이트',
    content: '26.02.10 업데이트 내역입니다. 새로운 업데이트 소식을 확인해보세요.',
    date: '2월 10일',
    unread: true,
    avatarClassName: 'bg-primary-800',
  },
];

const readNotifications: NotificationItem[] = [
  {
    id: 'read-1',
    sender: '한창우',
    message: ' 님이 지원했습니다',
    category: '그룹모집',
    content: '런칭되어 있는 위치 기반 서비스에서 운영과 개선을 함께할 팀원을 모집합니다.',
    date: '2월 10일',
    avatarSrc: '/mock/profile-2.png',
  },
  {
    id: 'read-2',
    sender: '한영만',
    message: ' 님이 지원했습니다',
    category: '정보/자료공유',
    content: '보내주신 자료 잘봤습니다.',
    date: '2월 10일',
    avatarSrc: '/mock/profile-3.png',
  },
  {
    id: 'read-3',
    sender: '치즈회사',
    message: ' 님이 지원했습니다',
    category: '채용공고',
    content: '홈페이지 마지막 마무리 페이지 작업자를 찾고 있습니다.',
    date: '2월 10일',
    avatarSrc: '/mock/profile-4.png',
  },
];

function cn(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function NotificationAvatar({ item }: { item: NotificationItem }) {
  if (item.avatarSrc) {
    return (
      <Image
        src={item.avatarSrc}
        alt=""
        width={24}
        height={24}
        className="h-[24px] w-[24px] shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      className={cn(
        'h-[24px] w-[24px] shrink-0 rounded-full',
        item.avatarClassName ?? 'bg-gray-300',
      )}
      aria-hidden="true"
    />
  );
}

function NotificationActionMenu({
  open,
  onOpen,
  onClose,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const handleStopPropagation = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const menuClassName = cn(
    'h-[32px] w-[88px] items-center justify-center rounded-[5px] border border-gray-300 bg-gray-50 px-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
    open ? 'flex' : 'hidden group-hover:flex',
  );

  return (
    <div
      className="absolute top-[10px] right-0 z-20"
      onClick={handleStopPropagation}
      onMouseDown={handleStopPropagation}
    >
      <div className={menuClassName}>
        <button
          type="button"
          className="flex h-[24px] w-[24px] items-center justify-center rounded-[4px] text-gray-500 transition-colors hover:bg-gray-200"
          aria-label="읽음 처리"
        >
          <span className="flex h-[18px] w-[18px] items-center justify-center">
            <MessageIcon
              aria-hidden="true"
              className="block h-[14px] w-[14px] shrink-0 translate-x-[1px]"
            />
          </span>
        </button>

        <span className="h-[16px] w-px bg-gray-300" aria-hidden="true" />

        <button
          type="button"
          onClick={onOpen}
          className="flex h-[24px] w-[24px] items-center justify-center rounded-[4px] text-gray-500 transition-colors hover:bg-gray-200"
          aria-label="삭제"
        >
          <span className="flex h-[18px] w-[18px] items-center justify-center">
            <DeleteIcon
              aria-hidden="true"
              className="block h-[14px] w-[14px] shrink-0 translate-x-[2px]"
            />
          </span>
        </button>

        <span className="h-[16px] w-px bg-gray-300" aria-hidden="true" />

        <button
          type="button"
          className="flex h-[24px] w-[24px] items-center justify-center rounded-[4px] text-gray-500 transition-colors hover:bg-gray-200"
          aria-label="이동"
        >
          <span className="flex h-[18px] w-[18px] items-center justify-center">
            <SendIcon
              aria-hidden="true"
              className="block h-[14px] w-[14px] shrink-0 translate-x-[1px]"
            />
          </span>
        </button>
      </div>

      {open ? (
        <div className="absolute top-[40px] right-0 z-30 box-border w-[157px] rounded-[5px] border border-gray-300 bg-gray-50 p-[11px] shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
          <p className="text-[12px] leading-[20px] font-medium text-gray-700">
            삭제하면 복구할 수 없습니다.
            <br />
            정말 삭제하시겠습니까?
          </p>

          <div className="mt-[8px] flex flex-col gap-[4px]">
            <button
              type="button"
              onClick={onClose}
              className="flex h-[24px] w-full items-center rounded-[5px] bg-transparent px-[12px] text-left text-[12px] leading-[18px] font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              네
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-[24px] w-full items-center rounded-[5px] bg-transparent px-[12px] text-left text-[12px] leading-[18px] font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              아니오
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NotificationCard({ item }: { item: NotificationItem }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  return (
    <article
      className={cn(
        'group relative box-border w-full min-w-0 border-b border-gray-200',
        isExpanded ? 'py-[12px]' : 'h-[87px] py-[12px]',
      )}
    >
      <NotificationActionMenu
        open={isDeleteConfirmOpen}
        onOpen={() => setIsDeleteConfirmOpen(true)}
        onClose={() => setIsDeleteConfirmOpen(false)}
      />

      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex h-full w-full min-w-0 items-start gap-[10px] text-left"
      >
        <NotificationAvatar item={item} />

        <div className="min-w-0 flex-1">
          <div className="flex h-[20px] items-center justify-between gap-[8px]">
            <p className="min-w-0 truncate text-[14px] leading-[20px] font-normal text-gray-600">
              <span className="font-medium text-gray-800">{item.sender}</span>
              {item.message}
            </p>

            <div className="flex shrink-0 items-center gap-[6px]">
              <span className="text-[12px] leading-[18px] font-normal text-gray-800">
                {item.date}
              </span>

              <span
                className={cn(
                  'h-[5px] w-[5px] rounded-full',
                  item.unread ? 'bg-secondary-600' : 'bg-gray-400',
                )}
                aria-hidden="true"
              />
            </div>
          </div>

          <p
            className={cn(
              'mt-[4px] max-w-full text-[14px] leading-[18px] font-normal text-gray-600',
              isExpanded
                ? 'break-words whitespace-pre-line'
                : '[display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2]',
            )}
          >
            <span className="font-medium text-gray-900">[{item.category}]</span>
            <span className="ml-[6px]">{item.content}</span>
          </p>
        </div>
      </button>
    </article>
  );
}

function NotificationSection({ title, items }: { title: string; items: NotificationItem[] }) {
  return (
    <section className="w-full min-w-0">
      <h3 className="mb-[20px] pl-[20px] text-[14px] leading-[30px] font-medium text-gray-500">
        {title}
      </h3>

      <div className="flex w-full min-w-0 flex-col">
        {items.map((item) => (
          <NotificationCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export function NotificationSidebar({ onClose }: NotificationSidebarProps) {
  return (
    <aside className="box-border h-dvh w-[388px] shrink-0 overflow-x-hidden overflow-y-auto border-r border-gray-300 bg-gray-50 px-[20px] py-[40px]">
      <header className="mb-[40px] flex h-[24px] w-full items-center justify-between">
        <h2 className="text-[16px] leading-[24px] font-medium text-gray-950">알림</h2>

        <button
          type="button"
          onClick={onClose}
          aria-label="알림 사이드바 닫기"
          className="flex h-[16px] w-[16px] items-center justify-center text-gray-500"
        >
          <DoubleArrowIcon
            aria-hidden="true"
            className="block h-[16px] w-[16px] shrink-0 rotate-180"
          />
        </button>
      </header>

      <div className="flex w-full min-w-0 flex-col gap-[26px]">
        <NotificationSection title="최신" items={recentNotifications} />
        <NotificationSection title="읽음" items={readNotifications} />
      </div>
    </aside>
  );
}

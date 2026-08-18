'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import PersonalProfileCardModal from '@/app/(app)/community/_components/ProfileCardModal/PersonalProfileCardModal';
import DoubleArrowIcon from '@/assets/icons/problem/double-arrow.svg';
import DeleteIcon from '@/assets/icons/sidebar/delete.svg';
import MessageIcon from '@/assets/icons/sidebar/message.svg';
import SendIcon from '@/assets/icons/sidebar/send.svg';
import { cn } from '@/lib/cn';
import { getMockPersonalProfile } from '@/mocks/profile/userProfiles';

type NotificationItem = {
  id: string;
  sender: string;
  message: string;
  category: string;
  content: string;
  date: string;
  unread?: boolean;
  showContentBullet?: boolean;
  avatarSrc?: string;
  avatarClassName?: string;
  href?: string;
  profileId?: number;
};

type NotificationSidebarProps = {
  onClose: () => void;
};

const initialRecentNotifications: NotificationItem[] = [
  {
    id: 'recent-1',
    sender: '유혹천',
    message: ' 님이 지원했습니다',
    category: '그룹모집',
    content:
      '- 이곳저곳 널리 퍼져있는 디저트를 한 눈에 편리하게 볼 수 있는 베이커리 플랫폼 프로젝트 입니다.\n- 함께하실 기획자 모집합니다 !☺\n\n🍰 건강 디저트 e-커머스 🍰\n건강 디저트 좋아하시는 분 계신가요~?\n건강 디저트 덕후들의 다양한 불편/불만 사항을 고려하여 기획한 건강 디저트 프로젝트입니다\n핵심 비전을 이끌어 내주실 역량 보유자들을 기다립니다!',
    date: '2월 10일',
    unread: true,
    avatarSrc: '/mock/profile-1.png',
    href: '/community/groups/1',
    profileId: 1,
  },
  {
    id: 'recent-2',
    sender: '치즈공장',
    message: ' 님이 지원했습니다',
    category: '채용공고',
    content: '텍스트로 시간 표시...',
    date: '2월 10일',
    unread: true,
    showContentBullet: true,
    avatarClassName: 'bg-error-subtle',
    href: '/community/jobs/1',
    profileId: 1,
  },
  {
    id: 'recent-3',
    sender: '치즈',
    message: ' 새로운 업데이트가 있습니다',
    category: '업데이트',
    content: '26.02.10 업데이트 내역입니다. 새로운 업데이트 소식이 있습니다.',
    date: '2월 10일',
    unread: true,
    avatarClassName: 'bg-primary-800',
    href: '/community',
  },
];

const initialReadNotifications: NotificationItem[] = [
  {
    id: 'read-1',
    sender: '한창우',
    message: ' 님이 지원했습니다',
    category: '그룹모집',
    content: '런칭되어 있는 위치 기반 서비스에서 운영과 개선을 함께할 백엔드 개발자분을 모십니다.',
    date: '2월 10일',
    avatarSrc: '/mock/profile-2.png',
    href: '/community/groups/1',
    profileId: 1,
  },
  {
    id: 'read-2',
    sender: '한영만',
    message: ' 님이 지원했습니다',
    category: '정보/자료공유',
    content: '보내주신 자료 잘봤습니다.',
    date: '2월 10일',
    avatarSrc: '/mock/profile-3.png',
    href: '/community/info/1',
    profileId: 1,
  },
  {
    id: 'read-3',
    sender: '치즈회사',
    message: ' 님이 지원했습니다',
    category: '채용공고',
    content: '홈페이지 마지막 마무리 페이지 작업자를 찾고 있습니다.',
    date: '2월 10일',
    avatarSrc: '/mock/profile-4.png',
    href: '/community/jobs/1',
    profileId: 1,
  },
];

function NotificationAvatar({ item, onClick }: { item: NotificationItem; onClick?: () => void }) {
  const avatar = item.avatarSrc ? (
    <Image
      src={item.avatarSrc}
      alt=""
      width={25}
      height={25}
      className="h-[25px] w-[25px] shrink-0 rounded-full object-cover"
    />
  ) : (
    <span
      className={cn(
        'h-[25px] w-[25px] shrink-0 rounded-full',
        item.avatarClassName ?? 'bg-gray-300',
      )}
      aria-hidden="true"
    />
  );

  if (!onClick) {
    return avatar;
  }

  return (
    <button
      type="button"
      aria-label={`${item.sender} 프로필 보기`}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="shrink-0"
    >
      {avatar}
    </button>
  );
}

function NotificationActionMenu({
  open,
  onOpen,
  onClose,
  onMarkAsRead,
  onConfirmDelete,
  onNavigate,
  showMarkAsRead,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onMarkAsRead: () => void;
  onConfirmDelete: () => void;
  onNavigate: () => void;
  showMarkAsRead: boolean;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown);
    };
  }, [onClose, open]);

  return (
    <div ref={menuRef} className="absolute top-[12px] right-0 z-20">
      <div
        className={cn(
          'items-center gap-[4px] rounded-[5px] border border-gray-400 bg-gray-50 p-[4px]',
          open ? 'flex' : 'hidden group-focus-within:flex group-hover:flex',
        )}
      >
        {showMarkAsRead ? (
          <button
            type="button"
            onClick={onMarkAsRead}
            className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[4px] text-gray-500 transition-colors hover:bg-gray-200"
            aria-label="읽음 처리"
          >
            <MessageIcon aria-hidden="true" className="block h-[12px] w-[14px] shrink-0" />
          </button>
        ) : (
          <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center text-gray-300">
            <MessageIcon aria-hidden="true" className="block h-[12px] w-[14px] shrink-0" />
          </span>
        )}

        <button
          type="button"
          onClick={onOpen}
          className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[4px] text-gray-500 transition-colors hover:bg-gray-200"
          aria-label="삭제"
        >
          <DeleteIcon aria-hidden="true" className="block h-[12px] w-[11px] shrink-0" />
        </button>

        <button
          type="button"
          onClick={onNavigate}
          className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[4px] text-gray-500 transition-colors hover:bg-gray-200"
          aria-label="이동"
        >
          <SendIcon aria-hidden="true" className="block h-[12px] w-[11px] shrink-0" />
        </button>
      </div>

      {open ? (
        <div className="absolute top-[40px] right-0 z-30 box-border flex w-[157px] flex-col gap-[8px] overflow-hidden rounded-[5px] border border-gray-400 bg-gray-50 p-[12px]">
          <p className="text-[12px] leading-[20px] font-medium tracking-[-0.24px] whitespace-nowrap text-gray-700">
            <span className="block">삭제하면 복구할 수 없습니다.</span>
            <span className="block">정말 삭제하시겠습니까?</span>
          </p>

          <div className="flex flex-col gap-[8px]">
            <button
              type="button"
              onClick={onConfirmDelete}
              className="flex h-[20px] w-full items-center rounded-[5px] bg-transparent px-[8px] text-left text-[12px] leading-[20px] font-medium tracking-[-0.24px] text-gray-950 transition-colors hover:bg-gray-200"
            >
              네
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-[20px] w-full items-center rounded-[5px] bg-transparent px-[8px] text-left text-[12px] leading-[20px] font-medium tracking-[-0.24px] text-gray-950 transition-colors hover:bg-gray-200"
            >
              아니오
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NotificationCard({
  item,
  expanded,
  onToggleExpand,
  onMarkAsRead,
  onDelete,
  onNavigate,
  onOpenProfile,
}: {
  item: NotificationItem;
  expanded: boolean;
  onToggleExpand: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
  onNavigate: () => void;
  onOpenProfile?: () => void;
}) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  return (
    <article
      className={cn(
        'group relative box-border w-full min-w-0 border-b border-gray-300',
        expanded ? 'py-[12px]' : 'h-[87px] py-[12px]',
      )}
    >
      <NotificationActionMenu
        open={isDeleteConfirmOpen}
        onOpen={() => setIsDeleteConfirmOpen(true)}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onMarkAsRead={onMarkAsRead}
        onConfirmDelete={() => {
          setIsDeleteConfirmOpen(false);
          onDelete();
        }}
        onNavigate={onNavigate}
        showMarkAsRead={Boolean(item.unread)}
      />

      <div className="flex h-full w-full min-w-0 items-start gap-[12px] text-left">
        <NotificationAvatar item={item} onClick={onOpenProfile} />

        <button
          type="button"
          aria-expanded={expanded}
          onClick={onToggleExpand}
          className={cn(
            'focus-visible:ring-secondary-600 flex min-w-0 flex-1 flex-col items-stretch text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            expanded ? 'gap-[4px]' : 'gap-[14px]',
          )}
        >
          <div className="flex w-full min-w-0 items-center justify-between gap-[8px]">
            <p className="min-w-0 truncate text-[14px] leading-[24px] font-normal tracking-[-0.28px] text-gray-700">
              <span className="font-medium text-gray-950">{item.sender}</span>
              {item.message}
            </p>

            <div className="flex shrink-0 items-center gap-[8px]">
              <span
                className={cn(
                  'text-[12px] leading-[24px] font-normal tracking-[-0.24px] text-black transition-opacity',
                  'group-hover:opacity-0',
                  isDeleteConfirmOpen && 'opacity-0',
                )}
              >
                {item.date}
              </span>

              <span
                className={cn(
                  'h-[8px] w-[8px] rounded-full',
                  item.unread ? 'bg-secondary-600' : 'bg-gray-300',
                )}
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="flex w-full min-w-0 items-start gap-[4px] text-[14px] leading-[24px] tracking-[-0.28px]">
            <span className="shrink-0 font-medium text-gray-950">[{item.category}]</span>

            <p
              className={cn(
                'min-w-0 flex-1 font-normal text-gray-600',
                expanded ? 'break-words whitespace-pre-line' : 'truncate whitespace-nowrap',
              )}
            >
              {item.showContentBullet ? '· ' : ''}
              {item.content}
            </p>
          </div>
        </button>
      </div>
    </article>
  );
}

export function NotificationSidebar({ onClose }: NotificationSidebarProps) {
  const router = useRouter();
  const [recentItems, setRecentItems] = useState(initialRecentNotifications);
  const [readItems, setReadItems] = useState(initialReadNotifications);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [profileCardOpen, setProfileCardOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(1);

  const selectedProfile = useMemo(
    () => getMockPersonalProfile(selectedProfileId),
    [selectedProfileId],
  );

  const handleMarkAsRead = (item: NotificationItem) => {
    if (!item.unread) return;

    setRecentItems((prev) => prev.filter((notification) => notification.id !== item.id));
    setReadItems((prev) => [{ ...item, unread: false }, ...prev]);
  };

  const handleDelete = (itemId: string) => {
    setRecentItems((prev) => prev.filter((notification) => notification.id !== itemId));
    setReadItems((prev) => prev.filter((notification) => notification.id !== itemId));

    if (expandedId === itemId) {
      setExpandedId(null);
    }
  };

  const handleNavigate = (item: NotificationItem) => {
    if (!item.href) return;

    router.push(item.href);
    onClose();
  };

  const renderSection = (title: string, items: NotificationItem[], hasContentGap = false) => (
    <section className={cn('flex w-full min-w-0 flex-col', hasContentGap && 'gap-[8px]')}>
      <h3 className="px-[20px] text-[14px] leading-[30px] font-medium tracking-[-0.28px] text-gray-500">
        {title}
      </h3>

      <div className="flex w-full min-w-0 flex-col">
        {items.map((item) => (
          <NotificationCard
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            onToggleExpand={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
            onMarkAsRead={() => handleMarkAsRead(item)}
            onDelete={() => handleDelete(item.id)}
            onNavigate={() => handleNavigate(item)}
            onOpenProfile={
              item.profileId
                ? () => {
                    setSelectedProfileId(item.profileId!);
                    setProfileCardOpen(true);
                  }
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );

  return (
    <aside className="box-border flex h-dvh w-[388px] shrink-0 flex-col gap-[20px] overflow-x-hidden overflow-y-auto border-r-2 border-gray-300 bg-gray-50 p-[20px] shadow-[0_4px_25px_rgba(85,85,85,0.1)]">
      <header className="flex min-h-[30px] w-full shrink-0 items-center justify-between">
        <h2 className="text-[16px] leading-[30px] font-bold tracking-[-0.32px] text-gray-950">
          알림
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label="알림 사이드바 닫기"
          className="flex h-[30px] w-[24px] items-center justify-center text-gray-500"
        >
          <DoubleArrowIcon
            aria-hidden="true"
            className="block h-[20px] w-[16px] shrink-0 rotate-180"
          />
        </button>
      </header>

      <div className="flex w-full min-w-0 flex-col gap-[20px]">
        {renderSection('최신', recentItems, true)}
        {renderSection('읽음', readItems)}
      </div>

      <PersonalProfileCardModal
        isOpen={profileCardOpen}
        onClose={() => setProfileCardOpen(false)}
        profile={selectedProfile}
      />
    </aside>
  );
}

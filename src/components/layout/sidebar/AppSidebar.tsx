'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// 반영 확인주석
import {
  AlarmIcon,
  CalendarIcon,
  CommunityIcon,
  MemoIcon,
  ProblemSolvingIcon,
} from '@/assets/icons/sidebar';
import { MiniCalendar } from '@/app/(app)/calendar/_ui/sidebar/MiniCalendar';

import ProfileImage from '@/components/common/ProfileImage';
import { NotificationSidebar } from './NotificationSidebar';

import { cn } from '@/lib/cn';
import {
  getSidebarIconClassName,
  getSidebarItemClassName,
  isSidebarItemActive,
} from '@/components/layout/sidebar/utils';

import { mockMypage } from '@/mocks/profile/userProfiles';

type NavigationIconType = 'bell' | 'calendar' | 'memo' | 'pencil' | 'community';

type LinkNavigationItem = {
  label: string;
  href: string;
  icon: NavigationIconType;
};

const linkNavigationItems: LinkNavigationItem[] = [
  { label: '일정 관리', href: '/calendar', icon: 'calendar' },
  { label: '메모', href: '/memo', icon: 'memo' },
  { label: '문제 풀이', href: '/problem', icon: 'pencil' },
  { label: '커뮤니티', href: '/community', icon: 'community' },
];

function SidebarIcon({ type }: { type: NavigationIconType }) {
  switch (type) {
    case 'bell':
      return <AlarmIcon width={16} height={20} aria-hidden="true" className="shrink-0" />;
    case 'calendar':
      return <CalendarIcon width={16} height={18} aria-hidden="true" className="shrink-0" />;
    case 'memo':
      return <MemoIcon width={16} height={16} aria-hidden="true" className="shrink-0" />;
    case 'pencil':
      return <ProblemSolvingIcon width={16} height={18} aria-hidden="true" className="shrink-0" />;
    case 'community':
      return <CommunityIcon width={16} height={15} aria-hidden="true" className="shrink-0" />;
    default:
      return null;
  }
}

export default function AppSidebar() {
  const pathname = usePathname();
  const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false);

  const isMyPageActive = !isNotificationSidebarOpen && isSidebarItemActive(pathname, '/mypage');

  const mypage = mockMypage;

  const profile =
    mypage.activeProfileType === 'personal' ? mypage.personalProfile : mypage.companyProfile;

  const profileName =
    mypage.activeProfileType === 'personal'
      ? mypage.personalProfile.nickname
      : mypage.companyProfile.companyName;

  return (
    <>
      <aside className="border-border bg-sidebar-bg z-50 flex h-dvh w-[260px] shrink-0 flex-col border-r-2">
        <div className="flex px-4 pt-[33px] pb-20">
          <Link
            href="/dashboard"
            aria-label="Cheese 홈"
            className="inline-flex"
            onClick={() => setIsNotificationSidebarOpen(false)}
          >
            <Image src="/brands/cheese-logo.svg" alt="CHEESE" width={150} height={41} priority />
          </Link>
        </div>

        <div className="flex flex-col gap-2 px-3 text-sm">
          <div>
            <Link
              href="/mypage"
              aria-label="마이페이지로 이동"
              aria-current={isMyPageActive ? 'page' : undefined}
              className={cn('h-[38px] gap-2 p-1', getSidebarItemClassName(isMyPageActive))}
              onClick={() => setIsNotificationSidebarOpen(false)}
            >
              <div className="flex h-[30px] w-[30px] items-center justify-center">
                <ProfileImage src={profile.profileImageUrl} size={25} />
              </div>

              <span>{profileName} 님</span>
            </Link>
          </div>

          <nav>
            <ul className="flex flex-col gap-2">
              <li>
                <button
                  type="button"
                  aria-pressed={isNotificationSidebarOpen}
                  onClick={() => setIsNotificationSidebarOpen((prev) => !prev)}
                  className={cn(
                    'h-[38px] gap-2 p-1',
                    getSidebarItemClassName(isNotificationSidebarOpen),
                  )}
                >
                  <span
                    className={cn(
                      'h-[30px] w-[30px]',
                      getSidebarIconClassName(isNotificationSidebarOpen),
                    )}
                  >
                    <SidebarIcon type="bell" />
                  </span>

                  <span>알림</span>
                </button>
              </li>
            </ul>

            <div aria-hidden="true" className="my-2 border-t border-gray-300" />

            <ul className="flex flex-col gap-2">
              {linkNavigationItems.map((item) => {
                const isActive =
                  !isNotificationSidebarOpen && isSidebarItemActive(pathname, item.href);

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setIsNotificationSidebarOpen(false)}
                      className={cn('h-[38px] gap-2 p-1', getSidebarItemClassName(isActive))}
                    >
                      <span className={cn('h-[30px] w-[30px]', getSidebarIconClassName(isActive))}>
                        <SidebarIcon type={item.icon} />
                      </span>

                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="mt-[29px] px-4">
          <MiniCalendar />
        </div>
      </aside>

      {isNotificationSidebarOpen ? (
        <div className="fixed top-0 left-[260px] z-40 h-dvh overflow-visible">
          <div className="h-full translate-x-0 transition-transform duration-200 ease-out">
            <NotificationSidebar onClose={() => setIsNotificationSidebarOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}

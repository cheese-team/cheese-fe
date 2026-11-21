'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  UserIcon as MypageIcon,
  SettingsIcon,
  AdminReportsIcon,
  AdminProblemIcon,
} from '@/assets/icons/settings';

import { useCurrentUser } from '@/queries/auth/useCurrentUser';

import { cn } from '@/lib/cn';

import {
  getSidebarIconClassName,
  getSidebarItemClassName,
} from '@/components/layout/sidebar/utils';
import { ADMIN_MENU_ITEMS, MYPAGE_MENU_ITEMS } from '../../_constants/mypageMenu';

import ApplicationsIcon from '@/assets/icons/common/file.svg';
import BookmarksIcon from '@/assets/icons/common/like-outline.svg';

const ICON_MAP = {
  mypage: <MypageIcon />,
  bookmarks: <BookmarksIcon />,
  applications: <ApplicationsIcon />,
  settings: <SettingsIcon />,
  problem: <AdminProblemIcon />,
  reports: <AdminReportsIcon />,
};

export default function MyPageSidebar() {
  const pathname = usePathname();

  const { data: user } = useCurrentUser();

  const isAdmin = user?.account.isAdmin === true;

  const menuItems = MYPAGE_MENU_ITEMS.filter(
    (item) => item.icon !== 'applications' || user?.account.profileType === 'personal',
  );

  return (
    <div className="bg-sidebar-bg h-full">
      <nav className="px-4 pt-[90px]">
        <ul className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn('h-[54px] gap-3 p-3', getSidebarItemClassName(isActive))}
                >
                  <span className={cn('h-4 w-4', getSidebarIconClassName(isActive))}>
                    {ICON_MAP[item.icon]}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {isAdmin && (
          <>
            <div aria-hidden="true" className="my-3 border-t border-gray-300" />

            <div>
              <span className="block p-2 text-[14px] font-medium text-gray-500">관리자</span>

              <ul className="flex flex-col gap-2">
                {ADMIN_MENU_ITEMS.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn('h-[54px] gap-3 p-3', getSidebarItemClassName(isActive))}
                      >
                        <span className={cn('h-4 w-4', getSidebarIconClassName(isActive))}>
                          {ICON_MAP[item.icon]}
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </nav>
    </div>
  );
}

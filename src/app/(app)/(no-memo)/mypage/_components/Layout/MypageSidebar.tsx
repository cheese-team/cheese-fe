'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { UserIcon as MypageIcon, SettingsIcon } from '@/assets/icons/settings';

import { cn } from '@/lib/cn';
import {
  getSidebarIconClassName,
  getSidebarItemClassName,
} from '@/components/layout/sidebar/utils';
import { MYPAGE_MENU_ITEMS } from '../../_constants/mypageMenu';

import ApplicationsIcon from '@/assets/icons/common/file.svg';
import BookmarksIcon from '@/assets/icons/common/like-outline.svg';

const ICON_MAP = {
  mypage: <MypageIcon />,
  bookmarks: <BookmarksIcon />,
  applications: <ApplicationsIcon />,
  settings: <SettingsIcon />,
};

export default function MyPageSidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-sidebar-bg h-full">
      <nav className="px-4 pt-[90px]">
        <ul className="flex flex-col gap-2">
          {MYPAGE_MENU_ITEMS.map((item) => {
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
      </nav>
    </div>
  );
}

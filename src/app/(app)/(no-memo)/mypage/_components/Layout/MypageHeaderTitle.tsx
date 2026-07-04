'use client';

import { usePathname } from 'next/navigation';

import { MYPAGE_MENU_ITEMS } from '../../_constants/mypageMenu';

export default function MypageHeaderTitle() {
  const pathname = usePathname();

  const currentMenu = MYPAGE_MENU_ITEMS.find((menu) => menu.href === pathname);

  return <h1 className="text-[24px] font-medium">{currentMenu?.label ?? ''}</h1>;
}

'use client';

import { usePathname } from 'next/navigation';

import MypageHeaderTitle from './_components/Layout/MypageHeaderTitle';
import MyPageSidebar from './_components/Layout/MypageSidebar';

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isMyPageMain = pathname === '/mypage';

  return (
    <div className="bg-background-2 flex min-h-dvh items-center justify-center px-8 py-6">
      <div className="flex h-[70vh] max-h-[780px] min-h-[560px] w-full max-w-[1200px] overflow-hidden rounded-[10px] border border-gray-300 bg-white">
        <aside className="w-[200px] shrink-0 border-r border-gray-300">
          <MyPageSidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className={isMyPageMain ? 'mb-8' : 'mb-5'}>
            <MypageHeaderTitle />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

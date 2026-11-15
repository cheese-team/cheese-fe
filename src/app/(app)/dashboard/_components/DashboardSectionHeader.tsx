import type { ReactNode } from 'react';

import Link from 'next/link';

type DashboardSectionHeaderProps = {
  icon: ReactNode;
  title: string;
  href: string;
};

export default function DashboardSectionHeader({ icon, title, href }: DashboardSectionHeaderProps) {
  return (
    <header className="mb-3">
      <Link href={href} className="inline-flex items-center gap-[10px] hover:underline">
        <span className="flex h-[30px] w-[30px] items-center justify-center text-gray-500 [&>svg]:w-5">
          {icon}
        </span>
        <h2 className="text-[14px] leading-[30px] font-bold text-gray-700">{title}</h2>
      </Link>
    </header>
  );
}

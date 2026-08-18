import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type DashboardSectionHeaderProps = {
  icon: ReactNode;
  title: string;
  className?: string;
};

export default function DashboardSectionHeader({
  icon,
  title,
  className,
}: DashboardSectionHeaderProps) {
  return (
    <header className={cn('mb-3 flex items-center gap-[10px]', className)}>
      <span className="flex h-[30px] w-[30px] items-center justify-center text-gray-500 [&>svg]:w-5">
        {icon}
      </span>
      <h2 className="text-[14px] leading-[30px] font-bold text-gray-700">{title}</h2>
    </header>
  );
}

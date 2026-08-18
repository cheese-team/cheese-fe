import { cn } from '@/lib/cn';

export function isSidebarItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getSidebarItemClassName(isActive: boolean) {
  return cn(
    'group flex w-full items-center rounded-[10px] leading-[30px] transition-colors duration-200',
    isActive
      ? 'bg-transparent text-sidebar-text-active font-bold'
      : 'text-sidebar-text font-medium hover:bg-sidebar-bg-active hover:text-sidebar-text-active',
  );
}

export function getSidebarIconClassName(isActive: boolean) {
  return cn(
    'flex items-center justify-center transition-colors duration-200',
    isActive
      ? 'text-sidebar-icon-active'
      : 'text-sidebar-icon group-hover:text-sidebar-icon-active',
  );
}

import { cn } from '@/lib/cn';

type ChipVariant = 'default' | 'FE' | 'BE' | 'interview' | 'document' | 'personal';

type ChipSize = 'sm' | 'md';

type ChipProps = {
  children: React.ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  className?: string;
};

const variantStyles: Record<ChipVariant, string> = {
  // 기본
  default: 'bg-white text-gray-950',

  // 커뮤니티 영역
  FE: 'bg-primary-600 text-gray-950',
  BE: 'bg-secondary-600 text-gray-50',

  // 대시보드(일정) 영역
  interview: 'bg-primary-600 text-gray-950',
  document: 'bg-secondary-200 text-gray-950',
  personal: 'bg-bg-3 text-gray-950',
};

const sizeStyles: Record<ChipSize, string> = {
  sm: 'h-6',
  md: 'h-[30px]',
};

export default function Chip({ children, variant = 'default', size = 'sm', className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-3 text-[12px] font-bold whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

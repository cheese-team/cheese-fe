import { cn } from '@/lib/cn';

type DocumentLinkItemProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  className?: string;
  labelClassName?: string;
};

export default function DocumentLinkItem({
  href,
  label,
  icon,
  className,
  labelClassName,
}: DocumentLinkItemProps) {
  return (
    <div className={cn('inline-flex items-center gap-2 text-gray-500', className)}>
      <div className="flex h-3 w-3 items-center justify-center">{icon}</div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('text-success leading-[30px] underline', labelClassName)}
      >
        {label}
      </a>
    </div>
  );
}

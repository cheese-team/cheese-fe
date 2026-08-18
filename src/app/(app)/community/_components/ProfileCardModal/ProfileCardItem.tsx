import { cn } from '@/lib/cn';

type ProfileCardItemProps = {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
};

export default function ProfileCardItem({
  label,
  value,
  valueClassName = 'border border-gray-400 py-2 text-gray-700 h-[46px]',
}: ProfileCardItemProps) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4 self-center">
      <span className="h-[19px] font-medium text-gray-800">{label}</span>
      <div
        title={typeof value === 'string' ? value : undefined}
        className={cn('block w-full truncate rounded-[10px] px-5', valueClassName)}
      >
        {value}
      </div>
    </div>
  );
}

import { cn } from '@/lib/cn';

type ProfileCardItemProps = {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
};

export default function ProfileCardItem({
  label,
  value,
  valueClassName = 'border border-gray-400 text-gray-700',
}: ProfileCardItemProps) {
  return (
    <div className="flex h-full w-full min-w-0 flex-col gap-4">
      <span className="h-[19px] font-medium text-gray-800">{label}</span>

      <div
        className={cn(
          'max-h-[120px] min-h-[46px] w-full min-w-0 flex-1 overflow-y-auto rounded-[10px] px-5 py-2 wrap-break-word',
          valueClassName,
        )}
      >
        {value}
      </div>
    </div>
  );
}

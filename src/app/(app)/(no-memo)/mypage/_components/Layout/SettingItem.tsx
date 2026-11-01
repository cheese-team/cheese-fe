import { Button } from '@/components/common/Button';
import { DocumentLinkItemList } from '@/components/common/DocumentLink';

import { cn } from '@/lib/cn';

import type { ProfileDocument } from '@/types/profile';

type SettingItemProps = {
  label: string;
  value?: string;
  truncateValue?: boolean;
  document?: ProfileDocument;
  urlLabel?: string;
  icon?: React.ReactNode;
  buttonIcon?: React.ReactNode;
  buttonIconPosition?: 'left' | 'right';
  buttonText?: string;
  buttonClassName?: string;
  onClick?: () => void;
};

export default function SettingItem({
  label,
  value,
  truncateValue = false,
  document,
  urlLabel,
  icon,
  buttonIcon,
  buttonIconPosition = 'left',
  buttonText,
  buttonClassName,
  onClick,
}: SettingItemProps) {
  const hasDocument = Boolean(document?.fileUrl || document?.url);

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-[15px]">
        <span className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center text-gray-500">
          {icon}
        </span>

        <div className="min-w-0 text-[14px] leading-[30px] text-gray-700">
          <h3 className="font-bold">{label}</h3>

          {document ? (
            hasDocument ? (
              <DocumentLinkItemList document={document} urlLabel={urlLabel} />
            ) : (
              <span className="text-gray-500">{`${label}를 추가해주세요`}</span>
            )
          ) : (
            <span
              className={cn(
                'block',
                truncateValue ? 'truncate' : 'break-words whitespace-pre-wrap',
                !value && 'text-gray-500',
              )}
              title={truncateValue ? value : undefined}
            >
              {value || `${label} 정보를 설정해주세요`}
            </span>
          )}
        </div>
      </div>

      <Button
        variant="outlineLightGray"
        size={38}
        paddingX={8}
        className={cn('shrink-0 gap-1 tracking-[-0.02em]', buttonClassName)}
        onClick={onClick}
      >
        {buttonIcon && buttonIconPosition === 'left' && (
          <span className="inline-flex h-[30px] w-5 items-center justify-center">{buttonIcon}</span>
        )}

        {buttonText}

        {buttonIcon && buttonIconPosition === 'right' && (
          <span className="inline-flex items-center justify-center">{buttonIcon}</span>
        )}
      </Button>
    </div>
  );
}

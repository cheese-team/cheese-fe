import { Button } from '@/components/common/Button';
import { DocumentLinkItemList } from '@/components/common/DocumentLink';

import type { ProfileDocument } from '@/types/profile';

type SettingItemProps = {
  label: string;
  value?: string;
  document?: ProfileDocument;
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
  document,
  icon,
  buttonIcon,
  buttonIconPosition = 'left',
  buttonText,
  buttonClassName,
  onClick,
}: SettingItemProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-[15px]">
        <span className="inline-flex h-[30px] w-[30px] items-center justify-center text-gray-500">
          {icon}
        </span>

        <div className="text-[14px] leading-[30px] text-gray-700">
          <h3 className="font-bold">{label}</h3>

          {document ? <DocumentLinkItemList document={document} /> : <span>{value}</span>}
        </div>
      </div>

      <Button
        variant="outlineLightGray"
        size={38}
        paddingX={8}
        className={`gap-[7px] ${buttonClassName ?? ''}`}
        onClick={onClick}
      >
        {buttonIcon && buttonIconPosition === 'left' && (
          <span className="inline-flex items-center justify-center">{buttonIcon}</span>
        )}

        {buttonText}

        {buttonIcon && buttonIconPosition === 'right' && (
          <span className="inline-flex items-center justify-center">{buttonIcon}</span>
        )}
      </Button>
    </div>
  );
}

import { DocumentLinkItem } from '@/components/common/DocumentLink';

import { cn } from '@/lib/cn';

import FileIcon from '@/assets/icons/common/file.svg';
import LinkIcon from '@/assets/icons/common/link.svg';

import type { ProfileDocument } from '@/types/profile';

type DocumentLinkItemListProps = {
  document: ProfileDocument;
  className?: string;
  labelClassName?: string;
};

export default function DocumentLinkItemList({
  document,
  className,
  labelClassName,
}: DocumentLinkItemListProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {document.fileUrl && (
        <DocumentLinkItem
          href={document.fileUrl}
          label={document.fileName}
          icon={<FileIcon className="h-3 w-3 text-gray-500" />}
          labelClassName={labelClassName}
        />
      )}

      {document.url && (
        <DocumentLinkItem
          href={document.url}
          label={document.urlLabel ?? document.url}
          icon={<LinkIcon className="h-3 w-3 text-gray-500" />}
          labelClassName={labelClassName}
        />
      )}
    </div>
  );
}

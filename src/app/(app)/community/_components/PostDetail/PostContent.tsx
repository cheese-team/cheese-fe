'use client';

import { sanitizeHtml } from '@/lib/sanitizeHtml';

import { POST_CONTENT_CLASS } from '../../_constants/community';

type PostContentProps = {
  content: string;
};

export default function PostContent({ content }: PostContentProps) {
  return (
    <div
      className={POST_CONTENT_CLASS}
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(content),
      }}
    />
  );
}

'use client';

import { useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';

import CommunityPostEditor from '../CommunityPostEditor';

import { COMMUNITY_CATEGORY_TABS } from '../../_constants/community';

import EditIcon from '@/assets/icons/common/edit.svg';

type CommunityPostFormProps = {
  mode?: 'create' | 'edit';
  onSubmit: (event: React.FormEvent<HTMLFormElement>, content: string) => void;
  initialContent?: string;
  children: ReactNode;
};

export default function CommunityPostForm({
  mode = 'create',
  onSubmit,
  initialContent = '',
  children,
}: CommunityPostFormProps) {
  const [content, setContent] = useState(initialContent);

  const router = useRouter();
  const pathname = usePathname();

  const currentCategory = COMMUNITY_CATEGORY_TABS.find((tab) => pathname.startsWith(tab.value));

  const listPageHref = currentCategory?.value ?? '/community/jobs';
  const detailPageHref = pathname.replace(/\/edit$/, '');

  const actionLabel = mode === 'edit' ? '수정' : '생성';
  const title = `${currentCategory?.label ?? '게시글'} ${actionLabel}`;
  const submitButtonText = mode === 'edit' ? '수정하기' : '등록하기';

  const formId = 'community-post-form';

  const handleBackClick = () => {
    // TODO: 공통 ConfirmModal 적용
    const isConfirmed = window.confirm('작성 중인 내용이 사라집니다. 이동하시겠습니까?');

    if (!isConfirmed) return;

    const backHref = mode === 'edit' ? detailPageHref : listPageHref;

    router.push(backHref);
  };

  return (
    <div className="px-[50px]">
      <article className="mx-auto w-full max-w-[1000px] overflow-hidden rounded-[10px] border border-gray-400">
        <header className="flex items-center justify-between bg-gray-100 px-6 py-3">
          <div className="flex gap-2">
            <BackButton onClick={handleBackClick} />
            <h2 className="text-[20px] leading-[30px] font-medium">{title}</h2>
          </div>

          <Button type="submit" form={formId} width={100} size={44} paddingX={12} className="gap-3">
            <EditIcon className="w-4" aria-hidden="true" />
            {submitButtonText}
          </Button>
        </header>

        <form
          id={formId}
          onSubmit={(event) => onSubmit(event, content)}
          className="flex flex-col gap-[30px] px-25 py-8"
        >
          {children}

          <section>
            <div className="border border-gray-400">
              <CommunityPostEditor value={content} onChange={setContent} />
            </div>
          </section>
        </form>
      </article>
    </div>
  );
}

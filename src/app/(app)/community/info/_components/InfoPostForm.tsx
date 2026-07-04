'use client';

import { useState } from 'react';

import { Input } from '@/components/common/Input';

import { CommunityPostForm } from '../../_components/CommunityPostForm';
import { FormField, FormDropdown, POST_INPUT_CLASS } from '../../_components/CommunityPostForm';

import { INFO_SORT_OPTIONS } from '../../_constants/community';
import { cn } from '@/lib/cn';
import { Button } from '@/components/common/Button';

import UploadIcon from '@/assets/icons/common/upload.svg';
import CloseIcon from '@/assets/icons/common/close.svg';

import useFileUpload from '@/hooks/useFileUpload';
import useTagInput from '@/hooks/useTagInput';

import type { InfoPost } from '@/types/community';

const INFO_CATEGORY_OPTIONS = INFO_SORT_OPTIONS.filter((option) => option.value !== 'all');

type InfoPostFormProps = {
  mode: 'create' | 'edit';
  initialValues?: InfoPost;
};

export default function InfoPostForm({ mode, initialValues }: InfoPostFormProps) {
  const [category, setCategory] = useState(initialValues?.category ?? '');

  // TODO: 수정 페이지에서는 기존 첨부파일과 새로 업로드한 파일을 함께 관리하도록 개선
  // (기존 파일 조회/삭제, 신규 파일 추가)
  const { files, fileInputRef, openFilePicker, addFiles, removeFile, openFile } = useFileUpload();

  const { tagInput, tags, setTagInput, removeTag, handleTagKeyDown } = useTagInput({
    initialTags: initialValues?.tags ?? [],
    maxTags: 5,
  });
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>, content: string) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const title = String(formData.get('title') ?? '');

    // TODO: API 연동 시 기존 첨부파일(existingFiles)과 신규 첨부파일(files)을 구분하여 전송
    const infoPostPayload = {
      title,
      category,
      tags,
      files,
      content,
    };

    if (mode === 'create') {
      // TODO: 생성 API + 게시글 상세 페이지로 이동
      alert('게시글이 등록되었습니다.');
      return;
    }

    // TODO: 수정 API + 게시글 상세 페이지로 이동
    alert('게시글이 수정되었습니다.');
  };

  return (
    <CommunityPostForm
      mode={mode}
      onSubmit={handleSubmit}
      initialContent={initialValues?.content ?? ''}
    >
      <section className="flex flex-col gap-[30px]">
        <Input
          label="제목"
          name="title"
          placeholder="제목"
          defaultValue={initialValues?.title ?? ''}
          className={cn(POST_INPUT_CLASS, 'h-16 border-0 text-[24px]')}
          inputClassName="font-medium leading-16 h-16"
        />

        <div className="flex flex-col gap-y-6">
          <FormField label="분류" labelClassName="text-[14px]" className="w-full max-w-[300px]">
            <FormDropdown value={category} options={INFO_CATEGORY_OPTIONS} onChange={setCategory} />
          </FormField>

          <div className="flex flex-col gap-2">
            <span className="text-[14px]">첨부파일</span>

            {files.length > 0 && (
              <div className="flex flex-col gap-1">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex items-center gap-2"
                  >
                    <button
                      type="button"
                      className="text-success max-w-[280px] truncate text-left underline"
                      onClick={() => openFile(file)}
                    >
                      {file.name}
                    </button>
                    <button
                      type="button"
                      aria-label={`${file.name} 삭제`}
                      className="text-gray-600 hover:text-gray-800"
                      onClick={() => removeFile(index)}
                    >
                      <CloseIcon className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input ref={fileInputRef} multiple type="file" className="hidden" onChange={addFiles} />
            <Button
              type="button"
              width={90}
              size={46}
              variant="outlineLightGray"
              className="gap-3 border-gray-300"
              onClick={openFilePicker}
            >
              <UploadIcon className="w-3" aria-hidden="true" />
              업로드
            </Button>
          </div>

          <FormField
            label="태그 등록"
            labelClassName="text-[14px]"
            className="w-full max-w-[624px]"
          >
            <Input
              hideMessageSpace
              label="태그 등록"
              name="tags"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="# 최대 5개의 태그를 설정할 수 있습니다"
              className={POST_INPUT_CLASS}
              inputClassName="font-medium"
            />

            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="bg-tag-yellow-100 hover:bg-tag-yellow-200 rounded-full px-3 py-1 transition-colors duration-200"
                    onClick={() => removeTag(tag)}
                  >
                    # {tag}
                  </button>
                ))}
              </div>
            )}
          </FormField>
        </div>
      </section>
    </CommunityPostForm>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';

import { CommunityPostForm } from '../../_components/CommunityPostForm';
import { FormField } from '../../_components/CommunityPostForm';

import useFileUpload from '@/hooks/useFileUpload';
import useTagInput from '@/hooks/useTagInput';
import { ApiError } from '@/api/client';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useCreateInfoPost } from '@/queries/community/useCreateInfoPost';
import { useUpdateInfoPost } from '@/queries/community/useUpdateInfoPost';
import { useUploadFile } from '@/queries/files/useUploadFile';
import { useUploadDocument } from '@/queries/files/useUploadDocument';

import { INFO_SORT_OPTIONS } from '../../_constants/community';

import UploadIcon from '@/assets/icons/common/upload.svg';
import CloseIcon from '@/assets/icons/common/close.svg';

import type { InfoPost } from '@/types/community/community';
import type { CreateInfoPostRequest } from '@/api/community.api';

const INFO_CATEGORY_OPTIONS = INFO_SORT_OPTIONS.filter((option) => option.value !== 'all');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

type FormErrors = Partial<Record<'title' | 'category', string>>;

type InfoPostFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Omit<InfoPost, 'author'>;
};

export default function InfoPostForm({ mode, initialValues }: InfoPostFormProps) {
  const router = useRouter();

  const [errors, setErrors] = useState<FormErrors>({});
  const clearError = (name: keyof FormErrors) => {
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const { data: user } = useCurrentUser();
  const { mutateAsync: createInfoPost, isPending: isCreatePending } = useCreateInfoPost();
  const { mutateAsync: updateInfoPost, isPending: isUpdatePending } = useUpdateInfoPost();
  const { mutateAsync: uploadFile, isPending: isUploadPending } = useUploadFile();
  const { mutateAsync: uploadDocument, isPending: isDocumentUploadPending } = useUploadDocument();
  const isSubmitting =
    isCreatePending || isUpdatePending || isUploadPending || isDocumentUploadPending;

  const [category, setCategory] = useState<CreateInfoPostRequest['category'] | ''>(
    initialValues?.category ?? '',
  );

  const [isExistingFileRemoved, setIsExistingFileRemoved] = useState(false);

  const { files, fileInputRef, openFilePicker, addFiles, removeFile, openFile } = useFileUpload({
    multiple: false,
  });

  const { tagInput, tags, tagError, handleTagInputChange, removeTag, handleTagKeyDown } =
    useTagInput({
      initialTags: initialValues?.tags ?? [],
      maxTags: 5,
      maxLength: 20,
    });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isSubmitting) return;

    const file = event.target.files?.[0];
    if (!file) return;

    const isDocument = /\.(pdf|docx)$/i.test(file.name);
    const isImage = file.type
      ? ALLOWED_IMAGE_TYPES.includes(file.type)
      : /\.(jpe?g|png|gif|webp)$/i.test(file.name);

    if (!isDocument && !isImage) {
      alert('JPG, PNG, GIF, WEBP, PDF, DOCX 파일만 첨부할 수 있습니다.');
      event.target.value = '';
      return;
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      alert('이미지 파일 크기는 최대 5MB까지 가능합니다.');
      event.target.value = '';
      return;
    }

    if (isDocument && file.size > MAX_DOCUMENT_SIZE) {
      alert('문서 파일 크기는 최대 10MB까지 가능합니다.');
      event.target.value = '';
      return;
    }

    addFiles(event);
  };

  const uploadAttachment = (file: File) =>
    /\.(pdf|docx)$/i.test(file.name)
      ? uploadDocument({ file, purpose: 'infoAttachment' })
      : uploadFile({ file });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, content: string) => {
    event.preventDefault();

    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);

    const title = String(formData.get('title') ?? '').trim();

    const nextErrors: FormErrors = {};

    if (!title) {
      nextErrors.title = '제목을 입력해주세요.';
    } else if (title.length > 100) {
      nextErrors.title = '제목은 최대 100자까지 입력할 수 있습니다.';
    }

    if (category === '') {
      nextErrors.category = '분류를 선택해주세요.';
      setErrors(nextErrors);
      return;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    if (mode === 'create') {
      try {
        const file = files[0];
        const uploadedFile = file ? await uploadAttachment(file) : undefined;

        const createdInfoPost = await createInfoPost({
          category,
          title,
          content,
          tags,
          ...(uploadedFile ? { attachmentFileId: uploadedFile.id } : {}),
        });

        router.replace(`/community/info/${createdInfoPost.id}`);
      } catch (error) {
        alert(
          error instanceof ApiError ? error.message : '정보/자료공유 게시글 등록에 실패했습니다.',
        );
      }
      return;
    }

    if (!user || !initialValues) return;

    try {
      const file = files[0];
      const uploadedFile = file ? await uploadAttachment(file) : undefined;

      await updateInfoPost({
        infoId: initialValues.id,
        data: {
          category,
          title,
          content,
          tags,
          authorProfileType: user.account.profileType,
          ...(uploadedFile
            ? { attachmentFileId: uploadedFile.id }
            : isExistingFileRemoved
              ? { attachmentFileId: null }
              : {}),
        },
      });

      router.replace(`/community/info/${initialValues.id}`);
    } catch (error) {
      alert(
        error instanceof ApiError ? error.message : '정보/자료공유 게시글 수정에 실패했습니다.',
      );
    }
  };

  return (
    <CommunityPostForm
      mode={mode}
      onSubmit={handleSubmit}
      initialContent={initialValues?.content ?? ''}
      isSubmitting={isSubmitting}
      noValidate
    >
      <section className="flex flex-col gap-[30px]">
        <Input
          required
          label="제목"
          name="title"
          maxLength={100}
          errorMessage={errors.title}
          onChange={() => clearError('title')}
          placeholder="제목"
          defaultValue={initialValues?.title ?? ''}
          className="h-16 border-0 text-[24px] tracking-normal"
          inputClassName="font-medium leading-16"
        />

        <div className="flex flex-col gap-y-6">
          <FormField
            label="분류"
            labelClassName="text-[14px]"
            className="w-full max-w-[300px]"
            required
          >
            <Select
              value={category}
              options={INFO_CATEGORY_OPTIONS}
              onChange={(value) => {
                if (value === 'question' || value === 'info' || value === 'resource') {
                  setCategory(value);
                  clearError('category');
                }
              }}
            />

            {errors.category && (
              <p role="alert" className="text-text-error text-xs font-medium tracking-[-0.04em]">
                {errors.category}
              </p>
            )}
          </FormField>

          <div className="flex flex-col gap-2">
            <span className="text-[14px]">첨부파일</span>

            {mode === 'edit' &&
              initialValues?.attachmentUrl &&
              files.length === 0 &&
              !isExistingFileRemoved && (
                <div className="flex items-center gap-2">
                  <a
                    href={initialValues.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-success max-w-[280px] truncate text-left underline"
                  >
                    {initialValues.attachmentFileName || '기존 첨부파일'}
                  </a>

                  <button
                    type="button"
                    aria-label="기존 첨부파일 삭제"
                    disabled={isSubmitting}
                    onClick={() => setIsExistingFileRemoved(true)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <CloseIcon className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              )}
            {files.length > 0 && (
              <div className="flex flex-col gap-1">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="flex items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => openFile(file)}
                      className="text-success max-w-[280px] truncate text-left underline"
                    >
                      {file.name}
                    </button>
                    <button
                      type="button"
                      aria-label={`${file.name} 삭제`}
                      disabled={isSubmitting}
                      onClick={() => removeFile(index)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <CloseIcon className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.docx"
              disabled={isSubmitting}
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              type="button"
              onClick={openFilePicker}
              disabled={isSubmitting}
              width={90}
              size={46}
              variant="outlineLightGray"
              className="gap-3 border-gray-300"
            >
              <UploadIcon className="w-3" aria-hidden="true" />
              업로드
            </Button>
            <p className="text-xs">
              이미지 최대 5MB(jpg, png, gif, webp) / 문서 최대 10MB(pdf, docx) 파일을 첨부할 수
              있습니다.
            </p>
          </div>

          <FormField
            label="태그 등록"
            labelClassName="text-[14px]"
            className="w-full max-w-[624px]"
          >
            <Input
              label="태그 등록"
              name="tags"
              placeholder="# 최대 5개의 태그를 설정할 수 있습니다"
              value={tagInput}
              errorMessage={tagError || undefined}
              onChange={(event) => handleTagInputChange(event.target.value)}
              onKeyDown={handleTagKeyDown}
              className="h-[30px]"
              inputClassName="font-medium"
            />

            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="bg-tag-yellow-100 hover:bg-tag-yellow-200 rounded-full px-3 py-1 transition-colors duration-200"
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

'use client';

import { useId, useRef, useState } from 'react';

import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import MypageModalLayout from './MypageModalLayout';

import PlusIcon from '@/assets/icons/common/plus.svg';
import DeleteIcon from '@/assets/icons/common/close.svg';

import { ApiError } from '@/api/client';
import { useUploadDocument } from '@/queries/files/useUploadDocument';

import type { DocumentPurpose } from '@/api/files.api';
import type { ProfileDocument } from '@/types/profile';

type DocumentEditModalProps = {
  title: string;
  inputLabel: string;
  document?: ProfileDocument;
  purpose: DocumentPurpose;
  isOpen: boolean;
  disabled: boolean;
  onClose: () => void;
  onSave: (document: ProfileDocument) => void;
};

export default function DocumentEditModal({
  title,
  inputLabel,
  document,
  purpose,
  isOpen,
  disabled,
  onClose,
  onSave,
}: DocumentEditModalProps) {
  const formId = useId();

  const [fileName, setFileName] = useState(document?.fileName ?? '');
  const [fileUrl, setFileUrl] = useState(document?.fileUrl);
  const [url, setUrl] = useState(document?.url ?? '');
  const [errorMessage, setErrorMessage] = useState('');

  const { mutateAsync: uploadDocument, isPending: isUploadPending } = useUploadDocument();
  const isDisabled = disabled || isUploadPending;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploadingRef = useRef(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const selectedFile = input.files?.[0];
    input.value = '';

    if (!selectedFile || isDisabled || isUploadingRef.current) return;

    if (!/\.(pdf|docx)$/i.test(selectedFile.name)) {
      setErrorMessage('PDF, DOCX 파일만 업로드할 수 있습니다.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage('파일 크기는 최대 10MB까지 가능합니다.');
      return;
    }

    isUploadingRef.current = true;
    setErrorMessage('');

    try {
      const uploadedFile = await uploadDocument({ file: selectedFile, purpose });
      setFileName(uploadedFile.originalName);
      setFileUrl(uploadedFile.url);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? `파일 업로드 실패: ${error.message}`
          : '파일 업로드에 실패했습니다. 다시 시도해 주세요.',
      );
    } finally {
      isUploadingRef.current = false;
    }
  };

  const handleFileRemove = () => {
    if (isDisabled || isUploadingRef.current) return;

    setFileName('');
    setFileUrl(undefined);
    setErrorMessage('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (isDisabled || isUploadingRef.current) return;
    onClose();
  };

  const handleFileButtonClick = () => {
    if (isDisabled || isUploadingRef.current) return;

    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isDisabled || isUploadingRef.current) return;
    const nextDocument: ProfileDocument = {
      ...document,
      fileName,
      fileUrl,
      url,
    };

    onSave(nextDocument);
  };

  return (
    <MypageModalLayout
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      submitFormId={formId}
      disabled={isDisabled}
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            disabled={isDisabled}
            onChange={handleFileChange}
          />

          <Input
            label={`${inputLabel} 파일`}
            value={fileName}
            readOnly
            disabled={isDisabled}
            placeholder="파일 첨부"
            className="h-10 px-2"
            inputClassName="cursor-default truncate"
            onClick={handleFileButtonClick}
            errorMessage={errorMessage}
            rightAddon={
              <div className="flex items-center gap-2">
                {fileUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileRemove();
                    }}
                    disabled={isDisabled}
                    aria-label="첨부파일 삭제"
                    className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <DeleteIcon className="h-2 w-2" />
                  </button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size={28}
                  paddingX={12}
                  disabled={isDisabled}
                  className="text-secondary-700 border-secondary-600 gap-1 border"
                  onClick={handleFileButtonClick}
                >
                  <PlusIcon className="h-2 w-2" />
                  가져오기
                </Button>
              </div>
            }
          />
          {!errorMessage && (
            <p className="flex h-[22px] items-end text-xs tracking-[-0.04em]">
              최대 10MB 까지 업로드 가능 (PDF, DOCX)
            </p>
          )}
        </div>

        <Input
          label={`${inputLabel} URL`}
          placeholder="URL 입력"
          value={url}
          disabled={isDisabled}
          className="h-10 px-2"
          onChange={(e) => setUrl(e.target.value)}
        />
      </form>
    </MypageModalLayout>
  );
}

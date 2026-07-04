'use client';

import { useId, useRef, useState } from 'react';

import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import MypageModalLayout from './MypageModalLayout';

import PlusIcon from '@/assets/icons/common/plus.svg';

import type { ProfileDocument } from '@/types/profile';

type DocumentEditModalProps = {
  title: string;
  inputLabel: string;
  document?: ProfileDocument;
  isOpen: boolean;
  onClose: () => void;
};

export default function DocumentEditModal({
  title,
  inputLabel,
  document,
  isOpen,
  onClose,
}: DocumentEditModalProps) {
  const formId = useId();

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState(document?.fileName ?? '');
  const [url, setUrl] = useState(document?.url ?? '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO: 파일 업로드/API 요청
    // TODO: response.fileUrl 받기

    onClose();
  };

  return (
    <MypageModalLayout isOpen={isOpen} onClose={onClose} title={title} submitFormId={formId}>
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.hwp"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] ?? null;

              setFile(selectedFile);
              setFileName(selectedFile?.name ?? '');
            }}
          />

          <Input
            label={`${inputLabel} 파일`}
            value={fileName}
            readOnly
            placeholder="파일 첨부"
            hideMessageSpace
            inputClassName="cursor-default truncate"
            onClick={handleFileButtonClick}
            rightAddon={
              <Button
                type="button"
                variant="outline"
                size={28}
                paddingX={12}
                className="text-secondary-700 border-secondary-600 gap-1 border"
                onClick={handleFileButtonClick}
              >
                <PlusIcon className="h-2 w-2" />
                가져오기
              </Button>
            }
          />
        </div>

        <Input
          label={`${inputLabel} URL`}
          placeholder="URL 입력"
          value={url}
          // hideMessageSpace
          onChange={(e) => setUrl(e.target.value)}
        />
      </form>
    </MypageModalLayout>
  );
}

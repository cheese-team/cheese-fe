import { apiClient } from '@/api/client';

export type FilePurpose = 'image' | 'coverLetter' | 'additionalDocument' | 'infoAttachment';

export type UploadedFile = {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  purpose: FilePurpose;
};

type UploadFileParams = {
  file: File;
};

export function uploadFile({ file }: UploadFileParams) {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient<UploadedFile>('/backend-api/files', {
    method: 'POST',
    body: formData,
  });
}

// TODO: 문서 업로드 API 연동 (coverLetter, additionalDocument, infoAttachment)

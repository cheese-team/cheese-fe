import { apiClient } from '@/api/client';

export type FilePurpose = 'image' | 'coverLetter' | 'additionalDocument' | 'infoAttachment';

export type DocumentPurpose = Exclude<FilePurpose, 'image'>;

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

type UploadDocumentParams = {
  file: File;
  purpose: DocumentPurpose;
};

export function uploadFile({ file }: UploadFileParams) {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient<UploadedFile>('/backend-api/files', {
    method: 'POST',
    body: formData,
  });
}

export function uploadDocument({ file, purpose }: UploadDocumentParams) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);

  return apiClient<UploadedFile>('/backend-api/files/documents', {
    method: 'POST',
    body: formData,
  });
}

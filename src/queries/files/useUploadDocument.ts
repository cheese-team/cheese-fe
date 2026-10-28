import { useMutation } from '@tanstack/react-query';

import { uploadDocument } from '@/api/files.api';

export function useUploadDocument() {
  return useMutation({
    mutationFn: uploadDocument,
  });
}

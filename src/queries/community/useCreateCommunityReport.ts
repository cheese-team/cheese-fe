import { useMutation } from '@tanstack/react-query';

import { createCommunityReport } from '@/api/community.api';

export function useCreateCommunityReport() {
  return useMutation({ mutationFn: createCommunityReport, retry: false });
}

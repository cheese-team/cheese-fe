import { apiClient } from './client';
import type { PublicUserProfile } from '@/types/publicProfile';

export function getPublicUserProfile({ userId, signal }: { userId: string; signal?: AbortSignal }) {
  return apiClient<PublicUserProfile>(`/backend-api/users/${encodeURIComponent(userId)}/profile`, {
    method: 'GET',
    cache: 'no-store',
    signal,
  });
}

export const userQueryKeys = {
  all: ['users'] as const,
  profile: (userId: string | undefined) => [...userQueryKeys.all, 'profile', userId] as const,
};

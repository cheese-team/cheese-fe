export const memoQueryKeys = {
  all: ['memo'] as const,

  data: () => [...memoQueryKeys.all, 'data'] as const,
};

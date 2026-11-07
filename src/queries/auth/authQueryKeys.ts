export const authQueryKeys = {
  all: ['auth'] as const,

  me: () => [...authQueryKeys.all, 'me'] as const,

  oauthSignupSession: () => [...authQueryKeys.all, 'oauth', 'signup-session'] as const,
};

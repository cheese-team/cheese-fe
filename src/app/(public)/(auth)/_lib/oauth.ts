export type OAuthProvider = 'google' | 'kakao';

export function startOAuthLogin(provider: OAuthProvider) {
  const origin = window.location.origin;
  const params = new URLSearchParams({ origin });

  window.location.assign(`/backend-api/auth/oauth/${provider}?${params.toString()}`);
}

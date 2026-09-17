import { apiClient, ApiError } from './client';

import type { ProfileType } from '@/types/profile';

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  nickname: string;
  email: string;
  activeProfileType: ProfileType;
};

export type CurrentUser = {
  account: {
    userId: string;
    email: string;
    activeProfileType: ProfileType;
    isAdmin: boolean;
  };
  profile: {
    id: number;
    profileType: ProfileType;
    displayName: string;
    profileImageUrl: string;
  };
};

export function login(data: LoginRequest) {
  return apiClient<AuthUser>('/backend-api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getMe() {
  return apiClient<CurrentUser>('/backend-api/auth/me', {
    method: 'GET',
    cache: 'no-store',
  });
}

export async function getMeFromServer(cookie: string) {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('API_BASE_URL이 설정되지 않았습니다.');
  }

  const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      Cookie: cookie,
    },
  });

  if (!response.ok) {
    throw new ApiError('사용자 인증에 실패했습니다.', response.status);
  }

  return (await response.json()) as CurrentUser;
}

export type LogoutResponse = {
  success: boolean;
};

export function logout() {
  return apiClient<LogoutResponse>('/backend-api/auth/logout', {
    method: 'POST',
  });
}

export type SignupRequest = {
  nickname: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  termsAgreed: boolean;
};

export function signup(data: SignupRequest) {
  return apiClient<AuthUser>('/backend-api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export type EmailVerificationPurpose = 'signup' | 'password-reset' | 'contact-change';

export type SendEmailCodeRequest = {
  email: string;
  purpose: EmailVerificationPurpose;
};

export type SendEmailCodeResponse = {
  success: boolean;
  expiresInSeconds: number;
};

export function sendEmailCode(data: SendEmailCodeRequest) {
  return apiClient<SendEmailCodeResponse>('/backend-api/auth/email/send-code', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export type VerifyEmailCodeRequest = {
  email: string;
  code: string;
};

export type VerifyEmailCodeResponse = {
  verified: boolean;
};

export function verifyEmailCode(data: VerifyEmailCodeRequest) {
  return apiClient<VerifyEmailCodeResponse>('/backend-api/auth/email/verify-code', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export type CheckNicknameResponse = {
  available: boolean;
};

export function checkNickname(nickname: string) {
  return apiClient<CheckNicknameResponse>('/backend-api/auth/check-nickname', {
    method: 'GET',
    cache: 'no-store',
    query: {
      nickname,
    },
  });
}

export type ResetPasswordRequest = {
  email: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

export type ResetPasswordResponse = {
  success: boolean;
};

export function resetPassword(data: ResetPasswordRequest) {
  return apiClient<ResetPasswordResponse>('/backend-api/auth/password-reset', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

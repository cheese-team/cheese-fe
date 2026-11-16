import { ApiError } from '@/api/client';
import { AUTH_MESSAGE } from '../_constants/authMessage';

import type { EmailVerificationPurpose } from '@/api/auth.api';

export function getSendEmailErrorMessage(
  error: unknown,
  purpose: EmailVerificationPurpose,
  isLoggedIn = false,
): string {
  if (!(error instanceof ApiError)) {
    return AUTH_MESSAGE.EMAIL.SEND_FAILED;
  }

  if (purpose === 'password-reset' && error.code === 'SOCIAL_PASSWORD_RESET_UNSUPPORTED') {
    const providerName =
      error.provider === 'google' ? '구글' : error.provider === 'kakao' ? '카카오' : '간편로그인';

    if (isLoggedIn) {
      return `해당 계정은 ${providerName} 계정으로 가입되어 있어\n비밀번호 변경이 불가합니다.`;
    }

    return `해당 이메일은 ${providerName} 계정으로 가입되어 있어\n비밀번호 변경이 불가합니다.\n\n${providerName} 계정으로 로그인해 주세요`;
  }

  if (error.status !== 400) {
    return AUTH_MESSAGE.EMAIL.SEND_FAILED;
  }

  if (
    purpose === 'contact-change' &&
    error.message === 'Cannot use a registered login email as contact email'
  ) {
    return '이미 등록된 이메일입니다. 다른 이메일을 입력해 주세요.';
  }

  if (purpose === 'signup' && error.message === 'Email is already registered') {
    return AUTH_MESSAGE.EMAIL.ALREADY_REGISTERED;
  }

  if (purpose === 'password-reset' && error.message === 'Email is not registered') {
    return AUTH_MESSAGE.EMAIL.UNREGISTERED;
  }

  return AUTH_MESSAGE.EMAIL.SEND_FAILED;
}

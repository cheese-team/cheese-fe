import { ApiError } from '@/api/client';
import { AUTH_MESSAGE } from '../_constants/authMessage';

import type { EmailVerificationPurpose } from '@/api/auth.api';

export function getSendEmailErrorMessage(
  error: unknown,
  purpose: EmailVerificationPurpose,
): string {
  if (!(error instanceof ApiError) || error.status !== 400) {
    return AUTH_MESSAGE.EMAIL.SEND_FAILED;
  }

  if (purpose === 'signup' && error.message === 'Email is already registered') {
    return AUTH_MESSAGE.EMAIL.ALREADY_REGISTERED;
  }

  if (purpose === 'password-reset' && error.message === 'Email is not registered') {
    return AUTH_MESSAGE.EMAIL.UNREGISTERED;
  }

  return AUTH_MESSAGE.EMAIL.SEND_FAILED;
}

import { getProfileWebHref } from '@/lib/getProfileWebHref';
import type { PublicProfileBase } from '@/types/publicProfile';

type ContactProfile = Partial<Pick<PublicProfileBase, 'email' | 'contactMethod' | 'contactUrl'>>;

/** 선호 연락 방법에 맞는 링크를 반환한다. 해당 주소가 없거나 유효하지 않으면 null을 반환한다. */
export function getPublicProfileContactHref(profile: ContactProfile): string | null {
  if (profile.contactMethod === 'email') {
    const email = profile.email?.trim();

    return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? `mailto:${encodeURIComponent(email)}`
      : null;
  }

  if (profile.contactMethod === 'kakaoOpenChat' || profile.contactMethod === 'googleForm') {
    return getProfileWebHref(profile.contactUrl);
  }

  return null;
}

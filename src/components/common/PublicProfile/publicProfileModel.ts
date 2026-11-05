import { getProfileWebHref } from '@/lib/getProfileWebHref';
import type { PublicProfileBase } from '@/types/publicProfile';

type ContactProfile = Partial<Pick<PublicProfileBase, 'email' | 'contactMethod' | 'contactUrl'>>;

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

import type { PublicUserProfile } from '@/types/publicProfile';

export function getProfileWebHref(value?: string | null): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

export function getPublicProfileContactHref(profile: PublicUserProfile): string | null {
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

export function getPublicProfileFields(profile: PublicUserProfile) {
  return profile.profileType === 'personal'
    ? [
        { label: '관심 직무', value: profile.interestedJob },
        { label: '내 스킬', value: profile.skills?.join(', ') },
        { label: '관심 분야', value: profile.interests?.join(', ') },
      ]
    : [
        { label: '기업 구분', value: profile.companyType },
        { label: '대표자명', value: profile.representativeName },
        { label: '산업 구분', value: profile.industryType?.join(', ') },
        {
          label: '사원 수',
          value:
            typeof profile.employeeCount === 'number'
              ? `${profile.employeeCount.toLocaleString('ko-KR')}명`
              : undefined,
        },
        { label: '설립일', value: profile.foundedAt },
      ];
}

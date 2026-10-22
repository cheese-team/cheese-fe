import { apiClient } from '@/api/client';
import type { CompanyProfile, PersonalProfile, ProfileDocument } from '@/types/profile';

type OptionalFields<T> = { [K in keyof T]?: T[K] | null };

export type PublicProfileDocumentResponse = OptionalFields<Required<ProfileDocument>>;

type PublicProfileCommonResponse = {
  profileImageUrl?: unknown;
};

export type PublicProfileResponse = PublicProfileCommonResponse &
  (
    | (OptionalFields<
        Omit<PersonalProfile, 'profileImageUrl' | 'coverLetter' | 'additionalDocument'>
      > & {
        profileType: 'personal';
        coverLetter?: PublicProfileDocumentResponse | null;
        additionalDocument?: PublicProfileDocumentResponse | null;
      })
    | (OptionalFields<Omit<CompanyProfile, 'profileImageUrl' | 'resumeTemplate'>> & {
        profileType: 'company';
        resumeTemplate?: PublicProfileDocumentResponse | null;
      })
  );

export type PublicPersonalProfile = Partial<PersonalProfile>;
export type PublicCompanyProfile = Partial<CompanyProfile>;
export type PublicProfile =
  | (PublicPersonalProfile & { profileType: 'personal' })
  | (PublicCompanyProfile & { profileType: 'company' });

function normalizeDocument(document?: PublicProfileDocumentResponse | null): ProfileDocument {
  return {
    fileName: document?.fileName ?? '',
    fileUrl: document?.fileUrl ?? '',
    url: document?.url ?? '',
    urlLabel: document?.urlLabel ?? '',
  };
}

export async function getPublicProfile(
  userId: string,
  signal?: AbortSignal,
): Promise<PublicProfile | null> {
  const response = await apiClient<PublicProfileResponse | null>(
    `/backend-api/users/${encodeURIComponent(userId)}/profile`,
    { method: 'GET', cache: 'no-store', signal },
  );

  if (!response) return null;

  const common = {
    profileImageUrl:
      typeof response.profileImageUrl === 'string' ? response.profileImageUrl : undefined,
    email: response.email ?? '',
    contactMethod: response.contactMethod ?? undefined,
    contactUrl: response.contactUrl ?? undefined,
  };

  if (response.profileType === 'personal') {
    return {
      ...common,
      profileType: 'personal',
      nickname: response.nickname ?? '',
      interestedJob: response.interestedJob ?? '',
      coverLetter: normalizeDocument(response.coverLetter),
      additionalDocument: normalizeDocument(response.additionalDocument),
      skills: response.skills ?? [],
      interests: response.interests ?? [],
    };
  }

  if (response.profileType === 'company') {
    return {
      ...common,
      profileType: 'company',
      companyName: response.companyName ?? '',
      representativeName: response.representativeName ?? '',
      companyType: response.companyType ?? '',
      industryType: response.industryType ?? [],
      employeeCount: response.employeeCount ?? undefined,
      foundedAt: response.foundedAt ?? '',
      resumeTemplate: normalizeDocument(response.resumeTemplate),
    };
  }

  throw new Error('공개 프로필 유형을 확인할 수 없습니다.');
}

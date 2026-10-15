import type { CompanyProfile, ContactMethod, PersonalProfile } from './profile';

type PublicProfileBase = {
  profileImageUrl: string | null;
  email: string;
  contactMethod: ContactMethod;
  contactUrl: string;
};

// 공개 API는 활성 프로필에 해당하는 항목만 반환하며 상세 항목은 선택 사항이다.
export type PublicUserProfile = PublicProfileBase &
  (
    | ({ profileType: 'personal' } & Partial<Omit<PersonalProfile, 'id' | keyof PublicProfileBase>>)
    | ({ profileType: 'company' } & Partial<Omit<CompanyProfile, 'id' | keyof PublicProfileBase>>)
  );

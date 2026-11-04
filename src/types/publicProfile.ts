import type { CompanyProfile, ContactMethod, PersonalProfile } from './profile';

export type PublicProfileBase = {
  profileImageUrl: string | null;
  email: string;
  contactMethod: ContactMethod;
  contactUrl: string;
};

export type PublicUserProfile = PublicProfileBase &
  (
    | ({ profileType: 'personal' } & Partial<Omit<PersonalProfile, 'id' | keyof PublicProfileBase>>)
    | ({ profileType: 'company' } & Partial<Omit<CompanyProfile, 'id' | keyof PublicProfileBase>>)
  );

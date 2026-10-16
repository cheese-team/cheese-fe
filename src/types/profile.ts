export type ProfileType = 'personal' | 'company';

export type ContactMethod = 'email' | 'kakaoOpenChat' | 'googleForm';

export type ProfileDocument = {
  fileName: string;
  fileUrl?: string;
  url: string;
  urlLabel?: string;
};

// TODO: GET profile의 상세 필드와 필수 여부는 기존 타입을 임시 유지하며, 응답 스펙 확인 필요.
export type PersonalProfile = {
  nickname: string;
  email: string;
  profileImageUrl?: string;

  interestedJob: string;
  coverLetter: ProfileDocument;
  additionalDocument: ProfileDocument;
  skills: string[];
  interests: string[];

  contactMethod: ContactMethod;
  contactUrl?: string;
};

// TODO: GET profile의 상세 필드와 필수 여부는 기존 타입을 임시 유지하며, 응답 스펙 확인 필요.
export type CompanyProfile = {
  companyName: string;
  email: string;
  profileImageUrl?: string;

  representativeName: string;
  companyType: string;
  resumeTemplate: ProfileDocument;
  industryType: string[];
  employeeCount: number;
  foundedAt: string;

  contactMethod: ContactMethod;
  contactUrl?: string;
};

export type AccountSettings = {
  contactMethod: ContactMethod;
  contactUrl?: string;
  contactEmail: string;
  passwordUpdatedAt: string;
  address: string;
};

export type ContactSettings = Pick<AccountSettings, 'contactMethod' | 'contactUrl'>;

export type Mypage = {
  loginEmail: string;
  accountSettings: AccountSettings;
} & (
  | { profileType: 'personal'; profile: PersonalProfile }
  | { profileType: 'company'; profile: CompanyProfile }
);

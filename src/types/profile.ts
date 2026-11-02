export type ProfileType = 'personal' | 'company';

export type ContactMethod = 'email' | 'kakaoOpenChat' | 'googleForm';

export type ProfileDocument = {
  fileName: string;
  fileUrl?: string;
  url: string;
  urlLabel?: string;
};

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

export type ContactSettings = Pick<AccountSettings, 'contactMethod' | 'contactUrl'> & {
  contactEmail?: string;
};

export type Mypage = {
  loginEmail: string;
  accountSettings: AccountSettings;
} & (
  | { profileType: 'personal'; profile: PersonalProfile }
  | { profileType: 'company'; profile: CompanyProfile }
);

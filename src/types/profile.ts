export type PersonalProfile = {
  id: number;
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
  id: number;
  nickname: string;
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
  contact: ContactMethod;
  email: string;
  passwordUpdatedAt: string;
  address: string;
};

export type ProfileDocument = {
  fileName: string;
  fileUrl?: string;
  url: string;
  urlLabel?: string;
};

export type ContactMethod = 'email' | 'kakaoOpenChat' | 'googleForm';

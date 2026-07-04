import { mockUserSummaries } from '@/mocks/profile/userSummaries';
import { AccountSettings, CompanyProfile, ContactMethod, PersonalProfile } from '@/types/profile';

const createDocument = (fileName: string) => ({
  fileName,
  fileUrl: 'https://google.com',
  url: 'https://google.com',
});

export function getMockPersonalProfile(id: number): PersonalProfile {
  const profile = mockPersonalProfiles.find((profile) => profile.id === id);

  if (!profile) {
    throw new Error(`Mock personal profile(${id})를 찾을 수 없습니다.`);
  }

  return profile;
}

export function getMockCompanyProfile(id: number): CompanyProfile {
  const profile = mockCompanyProfiles.find((profile) => profile.id === id);

  if (!profile) {
    throw new Error(`Mock company profile(${id})를 찾을 수 없습니다.`);
  }

  return profile;
}

export const mockPersonalProfiles: PersonalProfile[] = [
  // 로그인 유저
  {
    id: 1,
    nickname: '김치즈',
    email: 'cheese@test.com',
    profileImageUrl: '/mock/profile-3.png',
    interestedJob: 'FE (프론트엔드)',
    coverLetter: {
      fileName: '자기소개서_김치즈.pdf',
      fileUrl: 'https://google.com',
      url: 'https://google.com',
    },
    additionalDocument: {
      fileName: '이력서_김치즈.pdf',
      fileUrl: 'https://google.com',
      url: 'https://google.com',
    },
    skills: ['HTML5', 'CSS3', 'JavaScript'],
    interests: ['Redux', 'Zustand', 'Recoil', 'Context API'],

    contactMethod: 'email',
    contactUrl: undefined,
  },

  // 나머지 유저
  ...mockUserSummaries
    .filter((user) => user.type === 'personal' && user.id !== 1)
    .map((user) => ({
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      interestedJob: 'FE (프론트엔드)',
      coverLetter: createDocument(`자기소개서_${user.nickname}.pdf`),
      additionalDocument: createDocument(`이력서_${user.nickname}.pdf`),
      skills: ['HTML5', 'CSS3', 'JavaScript'],
      interests: ['Redux', 'Zustand', 'Recoil'],

      contactMethod: 'kakaoOpenChat' as ContactMethod,
      contactUrl: 'https://open.kakao.com/',
    })),
];

export const mockCompanyProfiles: CompanyProfile[] = [
  // 로그인 유저
  {
    id: 1,
    nickname: '치즈공장',
    email: 'cheese@test.com',
    profileImageUrl: '/mock/profile-6.png',
    representativeName: '변대환',
    companyType: '스타트업',
    resumeTemplate: {
      fileName: 'cheese_resume_template.pdf',
      fileUrl: 'https://google.com',
      url: 'https://google.com',
    },
    industryType: ['솔루션 SI', 'CRM', 'ERP'],
    employeeCount: 10,
    foundedAt: '2020-05-15',

    contactMethod: 'email',
    contactUrl: undefined,
  },

  // 나머지 유저
  ...mockUserSummaries
    .filter((user) => user.type === 'company' && user.id !== 1)
    .map((user) => ({
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      representativeName: '김지수',
      companyType: '대기업',
      resumeTemplate: createDocument(`${user.nickname}_resume_template.pdf`),
      industryType: ['IT 서비스', 'AI 플랫폼'],
      employeeCount: 2800,
      foundedAt: '2001-07-18',

      contactMethod: 'email' as ContactMethod,
      contactUrl: undefined,
    })),
];

export const mockAccountSettings: AccountSettings = {
  contact: 'email',
  email: 'cheese@test.com',
  passwordUpdatedAt: '2026-01-30',
  address: '서울특별시',
};

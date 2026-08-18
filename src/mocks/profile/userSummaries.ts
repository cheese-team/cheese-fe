import type { UserSummary } from '@/types/community/community';

export function getMockUserSummary(id: number, type: UserSummary['profileType']) {
  const user = mockUserSummaries.find((user) => user.id === id && user.profileType === type);

  if (!user) {
    throw new Error(`Mock user(${id}, ${type})를 찾을 수 없습니다.`);
  }

  return user;
}

export const mockUserSummaries: UserSummary[] = [
  // 로그인 계정 (개인모드 & 기업모드)
  {
    id: 1,
    profileType: 'personal',
    nickname: '김치즈',
    email: 'cheese@test.com',
    profileImageUrl: '/mock/profile-3.png',
  },
  {
    id: 1,
    profileType: 'company',
    nickname: '치즈공장',
    email: 'cheese@test.com',
    profileImageUrl: '/mock/profile-6.png',
  },

  {
    id: 2,
    profileType: 'company',
    nickname: '그림 컴퍼니',
    email: 'you@test.com',
    profileImageUrl: '/mock/profile-4.png',
  },
  {
    id: 3,
    profileType: 'personal',
    nickname: '바람',
    email: 'wind@test.com',
    profileImageUrl: '',
  },
  {
    id: 4,
    profileType: 'company',
    nickname: '구름 컴퍼니',
    email: 'cloud@test.com',
    profileImageUrl: '/mock/profile-6.png',
  },
  {
    id: 5,
    profileType: 'personal',
    nickname: '몽글이',
    email: 'mongle@test.com',
    profileImageUrl: '/mock/profile-1.png',
  },
  {
    id: 6,
    profileType: 'company',
    nickname: '감자칩 공장',
    email: 'frontend@test.com',
    profileImageUrl: '/mock/profile-1.png',
  },
  {
    id: 7,
    profileType: 'personal',
    nickname: '하늘',
    email: 'backend@test.com',
    profileImageUrl: '/mock/profile-2.png',
  },
  {
    id: 8,
    profileType: 'personal',
    nickname: '유진',
    email: 'react@test.com',
    profileImageUrl: '',
  },
  {
    id: 9,
    profileType: 'company',
    nickname: '치즈냥 컴퍼니',
    email: 'cloud@test.com',
    profileImageUrl: '/mock/profile-5.png',
  },
  {
    id: 10,
    profileType: 'company',
    nickname: '초록 컴퍼니',
    email: 'chocho@test.com',
    profileImageUrl: '',
  },
  {
    id: 11,
    profileType: 'personal',
    nickname: '한창우',
    profileImageUrl: '',
    email: 'changwoo@example.com',
  },
  {
    id: 12,
    profileType: 'personal',
    nickname: '김민준',
    profileImageUrl: '/mock/profile-5.png',
    email: 'minjun@example.com',
  },
  {
    id: 13,
    profileType: 'company',
    nickname: '서연 컴퍼니',
    profileImageUrl: '/mock/profile-4.png',
    email: 'seoyeon@example.com',
  },
  {
    id: 14,
    profileType: 'personal',
    nickname: '이도현',
    profileImageUrl: '/mock/profile-3.png',
    email: 'dohyeon@example.com',
  },
  {
    id: 15,
    profileType: 'company',
    nickname: '지우개 공장',
    profileImageUrl: '',
    email: 'jiwoo@example.com',
  },
  {
    id: 16,
    profileType: 'personal',
    nickname: '정수지',
    profileImageUrl: '/mock/profile-6.png',
    email: 'sooji@example.com',
  },
  {
    id: 17,
    profileType: 'personal',
    nickname: '토리',
    email: 'tori@test.com',
    profileImageUrl: '/mock/profile-3.png',
  },
  {
    id: 18,
    profileType: 'company',
    nickname: '보리 공장',
    email: 'bori@test.com',
    profileImageUrl: '/mock/profile-1.png',
  },
  {
    id: 19,
    profileType: 'company',
    nickname: '가방공장',
    email: 'jhkim@test.com',
    profileImageUrl: '/mock/profile-2.png',
  },
  {
    id: 20,
    profileType: 'personal',
    nickname: '도윤',
    email: 'dodo@test.com',
    profileImageUrl: '',
  },
  {
    id: 21,
    profileType: 'company',
    nickname: '지민 컴퍼니',
    email: 'jim@test.com',
    profileImageUrl: '/mock/profile-4.png',
  },
  {
    id: 22,
    profileType: 'personal',
    nickname: '초보개발자',
    email: 'developer@test.com',
    profileImageUrl: '/mock/profile-5.png',
  },
];

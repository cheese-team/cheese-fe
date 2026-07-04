import type { UserSummary } from '@/types/community';

export function getMockUserSummary(id: number, type: UserSummary['type']) {
  const user = mockUserSummaries.find((user) => user.id === id && user.type === type);

  if (!user) {
    throw new Error(`Mock user(${id}, ${type})를 찾을 수 없습니다.`);
  }

  return user;
}

export const mockUserSummaries: UserSummary[] = [
  // 로그인 계정 (개인모드 & 기업모드)
  {
    id: 1,
    type: 'personal',
    nickname: '김치즈',
    email: 'cheese@test.com',
    profileImageUrl: '/mock/profile-3.png',
  },
  {
    id: 1,
    type: 'company',
    nickname: '치즈공장',
    email: 'cheese@test.com',
    profileImageUrl: '/mock/profile-6.png',
  },

  {
    id: 2,
    type: 'company',
    nickname: '유옥천',
    email: 'you@test.com',
    profileImageUrl: '/mock/profile-4.png',
  },
  {
    id: 3,
    type: 'personal',
    nickname: '바람',
    email: 'wind@test.com',
    profileImageUrl: '',
  },
  {
    id: 4,
    type: 'company',
    nickname: '구름',
    email: 'cloud@test.com',
    profileImageUrl: '/mock/profile-6.png',
  },
  {
    id: 5,
    type: 'personal',
    nickname: '몽글이',
    email: 'mongle@test.com',
    profileImageUrl: '/mock/profile-1.png',
  },
  {
    id: 6,
    type: 'company',
    nickname: '감자칩',
    email: 'frontend@test.com',
    profileImageUrl: '/mock/profile-1.png',
  },
  {
    id: 7,
    type: 'personal',
    nickname: '하늘',
    email: 'backend@test.com',
    profileImageUrl: '/mock/profile-2.png',
  },
  {
    id: 8,
    type: 'personal',
    nickname: '유진',
    email: 'react@test.com',
    profileImageUrl: '',
  },
  {
    id: 9,
    type: 'company',
    nickname: '치즈냥',
    email: 'cloud@test.com',
    profileImageUrl: '/mock/profile-5.png',
  },
  {
    id: 10,
    type: 'company',
    nickname: '초록이',
    email: 'chocho@test.com',
    profileImageUrl: '',
  },
  {
    id: 11,
    type: 'personal',
    nickname: '한창우',
    profileImageUrl: '',
    email: 'changwoo@example.com',
  },
  {
    id: 12,
    type: 'personal',
    nickname: '김민준',
    profileImageUrl: '/mock/profile-5.png',
    email: 'minjun@example.com',
  },
  {
    id: 13,
    type: 'company',
    nickname: '박서연',
    profileImageUrl: '/mock/profile-4.png',
    email: 'seoyeon@example.com',
  },
  {
    id: 14,
    type: 'personal',
    nickname: '이도현',

    profileImageUrl: '/mock/profile-3.png',
    email: 'dohyeon@example.com',
  },
  {
    id: 15,
    type: 'company',
    nickname: '최지우',
    profileImageUrl: '',
    email: 'jiwoo@example.com',
  },
  {
    id: 16,
    type: 'personal',
    nickname: '정수지',
    profileImageUrl: '/mock/profile-6.png',
    email: 'sooji@example.com',
  },
  {
    id: 17,
    nickname: '토리',
    type: 'personal',
    email: 'tori@test.com',
    profileImageUrl: '/mock/profile-3.png',
  },
  {
    id: 18,
    nickname: '보리',
    type: 'company',
    email: 'bori@test.com',
    profileImageUrl: '/mock/profile-1.png',
  },
  {
    id: 19,
    nickname: '지훈',
    type: 'company',
    email: 'jhkim@test.com',
    profileImageUrl: '/mock/profile-2.png',
  },
  {
    id: 20,
    nickname: '도윤',
    type: 'personal',
    email: 'dodo@test.com',
    profileImageUrl: '',
  },
  {
    id: 21,
    nickname: '지민',
    type: 'company',
    email: 'jim@test.com',
    profileImageUrl: '/mock/profile-4.png',
  },
  {
    id: 22,
    nickname: '초보개발자',
    type: 'personal',
    email: 'developer@test.com',
    profileImageUrl: '/mock/profile-5.png',
  },
];

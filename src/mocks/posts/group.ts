import type { GroupPost } from '@/types/community';

import { getMockUserSummary } from '@/mocks/profile/userSummaries';
import getMockDeadline from '@/mocks/getMockDeadline';

export const groupPosts: GroupPost[] = [
  {
    id: 1,

    field: 'FE',
    title: '취업 포트폴리오 스터디 함께하실 분 모집합니다',

    recruitCount: 4,
    expectedPeriod: '4주',
    progressType: 'online',

    skills: ['React', 'TypeScript', 'Git'],
    applyMethod: '치즈',

    applicantCount: 6,

    author: getMockUserSummary(11, 'personal'),

    deadline: getMockDeadline(17),
    createdAt: '2026-01-28',

    viewCount: 128,
    likeCount: 24,
    commentCount: 8,

    imageUrl: '/mock/info-1.jpg',

    content: `<p>취업 포트폴리오를 함께 점검하고 개선할 스터디원을 모집합니다.</p>
<p>주 1회 온라인으로 모여 각자 작업한 포트폴리오를 공유하고, 서로 피드백을 주고받는 방식으로 진행할 예정입니다.</p>
<p></p>
<p>프론트엔드 취업을 준비 중이거나 포트폴리오 완성도를 높이고 싶은 분들과 함께하고 싶습니다.</p>
`,

    isLiked: true,
    isApplied: true,
  },

  {
    id: 2,

    field: 'BE',
    title: 'Spring Boot 사이드 프로젝트 팀원 모집',

    recruitCount: 3,
    expectedPeriod: '8주',
    progressType: 'offline',

    skills: ['Spring Boot', 'MySQL', 'JPA'],
    applyMethod: '치즈',

    applicantCount: 4,

    author: getMockUserSummary(12, 'personal'),

    deadline: null,
    createdAt: '2026-01-30',

    viewCount: 96,
    likeCount: 17,
    commentCount: 5,

    imageUrl: '/mock/info-2.jpg',

    content: `<p>Spring Boot 기반 사이드 프로젝트를 함께 진행할 백엔드 팀원을 모집합니다.</p>
<p>기획은 어느 정도 정리되어 있으며, API 설계와 DB 모델링부터 함께 진행할 예정입니다.</p>
<p></p>
<p>협업 경험을 쌓고 싶은 분, 꾸준히 참여 가능하신 분이면 좋겠습니다.</p>
`,

    isLiked: false,
    isApplied: true,
  },

  {
    id: 3,

    field: 'FE',
    title: 'React 기반 토이 프로젝트 같이 하실 분 구해요',

    recruitCount: 2,
    expectedPeriod: '6주',
    progressType: 'online/offline',

    skills: ['React', 'Zustand', 'Tailwind CSS'],
    applyMethod: '치즈',

    applicantCount: 3,

    author: getMockUserSummary(13, 'company'),

    deadline: getMockDeadline(1),
    createdAt: '2026-02-01',

    viewCount: 154,
    likeCount: 32,
    commentCount: 12,

    imageUrl: '/mock/info-3.jpg',

    content: `<p>React 기반 토이 프로젝트를 함께 만들 프론트엔드 팀원을 구합니다.</p>
<p></p>
<p>작은 기능부터 시작해서 상태 관리, 라우팅, UI 컴포넌트 분리까지 함께 연습해보는 것이 목표입니다.</p>
<p>초보자도 괜찮지만, 꾸준히 소통 가능하신 분이면 좋겠습니다.</p>
`,

    isLiked: true,
    isApplied: false,
  },

  {
    id: 4,

    field: 'BE',
    title: 'Node.js + Express 서버 스터디 인원 모집합니다',

    recruitCount: 5,
    expectedPeriod: '5주',
    progressType: 'online',

    skills: ['Node.js', 'Express', 'MongoDB'],
    applyMethod: '치즈',

    applicantCount: 7,

    author: getMockUserSummary(14, 'personal'),

    deadline: getMockDeadline(-3),
    createdAt: '2026-02-03',

    viewCount: 112,
    likeCount: 21,
    commentCount: 9,

    imageUrl: '/mock/info-4.jpg',

    content: `<p>Node.js와 Express를 활용해 서버 개발을 함께 공부할 스터디원을 모집합니다.</p>
<p>REST API 설계, 인증 처리, 데이터베이스 연결 등을 실습 중심으로 진행합니다.</p>
<p>백엔드 입문자나 기초를 다시 정리하고 싶은 분께 적합합니다.</p>
`,

    isLiked: false,
    isApplied: true,
  },

  {
    id: 5,

    field: 'FE',
    title: 'UI/UX 개선 중심 프론트 협업 프로젝트 참여자 모집',

    recruitCount: 3,
    expectedPeriod: '7주',
    progressType: 'online/offline',

    skills: ['Next.js', 'Figma', 'Tailwind CSS'],
    applyMethod: '치즈',

    applicantCount: 5,

    author: getMockUserSummary(15, 'company'),

    deadline: null,
    createdAt: '2026-02-05',

    viewCount: 87,
    likeCount: 14,
    commentCount: 6,

    imageUrl: '/mock/info-5.jpg',

    content: `<p>기존 화면을 개선하는 방식의 프론트엔드 협업 프로젝트입니다.</p>
<p>Figma 시안을 참고해 UI를 구현하고, 컴포넌트 구조와 사용자 경험을 함께 개선해볼 예정입니다.</p>
<p>디자인을 코드로 옮기는 작업에 관심 있는 분을 찾고 있습니다.</p>
`,

    isLiked: true,
    isApplied: false,
  },

  {
    id: 6,

    field: 'BE',
    title: '대규모 트래픽 처리 경험을 위한 백엔드 프로젝트',

    recruitCount: 4,
    expectedPeriod: '10주',
    progressType: 'offline',

    skills: ['Spring Boot', 'Redis', 'Docker'],
    applyMethod: '치즈',

    applicantCount: 9,

    author: getMockUserSummary(1, 'personal'),

    deadline: getMockDeadline(7),
    createdAt: '2026-02-07',

    viewCount: 203,
    likeCount: 45,
    commentCount: 18,

    imageUrl: '/mock/info-6.jpg',

    content: `<p>대규모 트래픽 상황을 가정한 백엔드 프로젝트를 함께 진행합니다.</p>
<p></p>
<p>캐싱, 동시성 처리, 성능 개선, 배포 환경 구성 등을 경험해보는 것이 목표입니다.</p>
<p>기본적인 백엔드 개발 경험이 있고, 심화 주제를 다뤄보고 싶은 분께 추천합니다.</p>
`,

    isLiked: true,
    isApplied: false,
  },
];

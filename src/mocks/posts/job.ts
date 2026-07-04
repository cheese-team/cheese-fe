import type { JobPost } from '@/types/community';

import { getMockUserSummary } from '@/mocks/profile/userSummaries';
import getMockDeadline from '@/mocks/getMockDeadline';

export const jobPosts: JobPost[] = [
  {
    id: 1,
    companyName: '치즈공장',
    title: '2026년 스타트업 인턴 부문 경력직 채용',
    applicantCount: 5,

    author: getMockUserSummary(3, 'personal'),

    field: 'FE',
    skills: ['React', 'TypeScript', 'Next.js'],
    career: '신입, 경력',
    education: 'highSchool',
    location: '광주 광산구',
    employmentType: 'intern',

    deadline: getMockDeadline(10),
    createdAt: '2026-01-10',
    viewCount: 128,
    likeCount: 24,

    content: `<p>안녕하세요.</p>
<p></p>
<p>치즈공장에서 프론트엔드 인턴을 모집합니다.</p>
<p></p>
<p><strong><담당 업무></strong></p>
<p>- React 기반 웹 서비스 개발</p>
<p>- TypeScript 코드 작성 및 유지보수</p>
<p>- 디자이너 및 백엔드 개발자와 협업</p>
<p></p>
<p><strong><자격 요건></strong></p>
<p>- React 사용 경험</p>
<p>- Git 사용 경험</p>
<p>- 원활한 커뮤니케이션 능력</p>
<p></p>
<p><strong><우대 사항></strong></p>
<p>- Next.js 경험</p>
<p>- 사이드 프로젝트 경험</p>
<p></p>
<p></p>
<p>많은 관심과 지원 부탁드립니다.</p>
`,
    imageUrl: '/mock/info-1.jpg',

    apply: {
      type: 'homepage',
      url: 'https://google.com',
    },

    isLiked: false,
    isApplied: true,
  },
  {
    id: 2,
    companyName: '프론트랩',
    title: '프론트엔드 개발자 정규직 채용',
    applicantCount: 125,

    author: getMockUserSummary(18, 'company'),

    field: 'FE',
    skills: ['JavaScript', 'React', 'Tailwind CSS'],
    career: '경력 1년 ↑',
    education: 'none',
    location: '서울 강남구',
    employmentType: 'fullTime',

    deadline: getMockDeadline(-6),
    createdAt: '2026-01-14',
    viewCount: 246,
    likeCount: 87,

    content: `<p>프론트랩에서 프론트엔드 개발자를 채용합니다.</p>
<p></p>
<p><strong><담당 업무></strong></p>
<p>- React 기반 서비스 개발</p>
<p>- 공통 컴포넌트 설계 및 유지보수</p>
<p>- 서비스 성능 개선</p>
<p></p>
<p><strong>자격 요건</strong></p>
<p>- JavaScript 및 React 활용 경험</p>
<p>- 협업 경험</p>
<p>- 웹 표준에 대한 이해</p>
<p></p>
<p><strong><우대 사항></strong></p>
<p>- TypeScript 경험</p>
<p>- 테스트 코드 작성 경험</p>
<p></p>
<p>함께 성장할 분들의 지원을 기다립니다.</p>
`,
    imageUrl: '/mock/info-2.jpg',

    apply: {
      type: 'direct',
    },

    isLiked: true,
    isApplied: true,
  },
  {
    id: 3,
    companyName: '백엔드코어',
    title: 'Spring Boot 기반 백엔드 개발자 모집',
    applicantCount: 56,

    author: getMockUserSummary(5, 'personal'),

    field: 'BE',
    skills: ['Java', 'Spring Boot', 'MySQL'],
    career: '경력 2년 ↑',
    education: 'college',
    location: '서울 마포구',
    employmentType: 'fullTime',

    deadline: null,
    createdAt: '2026-01-18',
    viewCount: 173,
    likeCount: 42,

    content: `<p>백엔드코어에서 Spring Boot 개발자를 모집합니다.</p>
<p></p>
<p><strong><담당 업무></strong></p>
<p>- REST API 개발 및 운영</p>
<p>- MySQL 데이터베이스 설계</p>
<p>- 서버 성능 개선</p>
<p></p>
<p><strong>자격 요건</strong></p>
<p>- Java 및 Spring Boot 경험</p>
<p>- SQL 활용 능력</p>
<p>- Git 협업 경험</p>
<p></p>
<p><strong><우대 사항></strong></p>
<p>- AWS 경험</p>
<p>- 대용량 트래픽 처리 경험</p>
<p></p>
<p>열정 있는 개발자분들의 많은 지원 바랍니다.</p>
`,
    imageUrl: '/mock/info-3.jpg',

    apply: {
      type: 'homepage',
      url: 'https://naver.com',
    },

    isLiked: false,
    isApplied: false,
  },
  {
    id: 4,
    companyName: 'UI팩토리',
    title: 'UI/UX 중심 프론트엔드 개발자 채용',
    applicantCount: 2,

    author: getMockUserSummary(21, 'company'),

    field: 'FE',
    skills: ['Figma', 'React', 'CSS'],
    career: '신입',
    education: 'none',
    location: '부산 해운대구',
    employmentType: 'contract',

    deadline: null,
    createdAt: '2026-01-22',
    viewCount: 201,
    likeCount: 65,

    content: `<p>UI팩토리에서 UI/UX 중심 프론트엔드 개발자를 채용합니다.</p>
<p></p>
<p><strong><담당 업무></strong></p>
<p>- 사용자 중심 인터페이스 개발</p>
<p>- 디자인 시스템 구축 및 관리</p>
<p>- 서비스 화면 개선</p>
<p></p>
<p><strong>자격 요건</strong></p>
<p>- React 활용 경험</p>
<p>- CSS 및 반응형 웹 구현 경험</p>
<p>- 협업 능력</p>
<p></p>
<p><strong><우대 사항></strong></p>
<p>- Figma 활용 경험</p>
<p>- 디자인 시스템 구축 경험</p>
<p></p>
<p>사용자 경험에 관심 있는 분들의 지원을 기다립니다.</p>
`,
    imageUrl: '/mock/info-4.jpg',

    apply: {
      type: 'direct',
    },

    isLiked: true,
    isApplied: false,
  },
  {
    id: 5,
    companyName: '데브스테이션',
    title: 'Next.js 기반 웹 서비스 개발자 채용',
    applicantCount: 56,

    author: getMockUserSummary(7, 'personal'),

    field: 'FE, BE',
    skills: ['Next.js', 'TypeScript', 'React Query'],
    career: '경력 3년 ↑',
    education: 'college',
    location: '서울 서초구',
    employmentType: 'fullTime',

    deadline: getMockDeadline(-2),
    createdAt: '2026-01-25',
    viewCount: 389,
    likeCount: 113,

    content: `<p>데브스테이션에서 Next.js 개발자를 모집합니다.</p>
<p><strong><담당 업무></strong></p>
<p></p>
<p>- Next.js 기반 웹 서비스 개발</p>
<p>- 데이터 연동 및 상태 관리</p>
<p>- 사용자 경험 개선</p>
<p></p>
<p><strong>자격 요건</strong></p>
<p>- React 및 Next.js 경험</p>
<p>- TypeScript 활용 능력</p>
<p>- Git 사용 경험</p>
<p></p>
<p><strong><우대 사항></strong></p>
<p>- React Query 경험</p>
<p>- SSR 및 SEO 최적화 경험</p>
<p></p>
<p></p>
<p>함께 성장할 개발자를 찾고 있습니다.</p>
`,
    imageUrl: '/mock/info-5.jpg',

    apply: {
      type: 'homepage',
      url: 'https://github.com',
    },

    isLiked: true,
    isApplied: false,
  },
  {
    id: 6,
    companyName: '클라우드웨이',
    title: '클라우드 기반 백엔드 개발자 채용 (AWS)',
    applicantCount: 33,

    author: getMockUserSummary(1, 'personal'),

    field: 'BE',
    skills: ['Node.js', 'AWS', 'Docker'],
    career: '경력 2년 ↑',
    education: 'none',
    location: '경기 성남시',
    employmentType: 'fullTime',

    deadline: getMockDeadline(1),
    createdAt: '2026-01-28',
    viewCount: 312,
    likeCount: 38,

    content: `<p>클라우드웨이에서 클라우드 기반 백엔드 개발자를 채용합니다.</p>
<p></p>
<p><strong><담당 업무></strong></p>
<p>- Node.js 기반 서버 개발</p>
<p>- AWS 인프라 운영</p>
<p>- Docker 환경 구축 및 관리</p>
<p></p>
<p><strong>자격 요건</strong></p>
<p>- Node.js 활용 경험</p>
<p>- Docker 사용 경험</p>
<p>- 협업 경험</p>
<p></p>
<p><strong><우대 사항></strong></p>
<p>- AWS 서비스 운영 경험</p>
<p>- CI/CD 구축 경험</p>
<p></p>
<p>클라우드 환경에 관심 있는 분들의 많은 지원 바랍니다.</p>
`,
    imageUrl: '/mock/info-6.jpg',

    apply: {
      type: 'homepage',
      url: 'https://aws.amazon.com',
    },

    isLiked: true,
    isApplied: false,
  },
];

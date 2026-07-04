import type { Comment } from '@/app/(app)/community/_components/Comment/types';
import type { InfoPost } from '@/types/community';

import { getMockUserSummary } from '@/mocks/profile/userSummaries';

export const infoPosts: InfoPost[] = [
  {
    id: 1,
    author: getMockUserSummary(1, 'personal'),
    createdAt: '2026-02-01',

    thumbnailUrl: '/mock/info-1.jpg',

    category: 'info',
    title: '신입 프론트엔드 포트폴리오 구성 팁 정리',

    content: `<p>포트폴리오를 만들 때 프로젝트 설명, 문제 해결 과정, 기술 선택 이유를 어떻게 정리하면 좋은지 공유합니다.</p>
<p></p>
<p>특히 각 프로젝트마다 어떤 문제를 정의했고, 이를 해결하기 위해 어떤 접근 방식을 선택했는지 구체적으로 작성하는 것이 중요합니다.</p>
<p>또한 코드 구조, 성능 개선 경험, 협업 과정에서의 역할 등을 함께 정리하면 훨씬 설득력 있는 포트폴리오가 됩니다.</p>
`,

    tags: ['포트폴리오', '프론트엔드', '취업준비'],

    attachmentFileName: 'frontend-portfolio-guide.pdf',
    attachmentUrl: '/mock/mockFile.pdf',

    viewCount: 1280,
    likeCount: 86,
    commentCount: 14,

    isLiked: true,
  },

  {
    id: 2,
    author: getMockUserSummary(6, 'company'),
    createdAt: '2026-02-02',

    thumbnailUrl: '/mock/info-2.jpg',

    category: 'question',
    title: 'Next.js App Router에서 인증 처리 어떻게 하시나요?',

    content: `<p>쿠키 기반 인증과 클라이언트 상태 관리를 함께 사용할 때 구조를 어떻게 잡는지 궁금합니다.</p>
`,

    tags: ['Next.js', '인증', 'React Query'],

    viewCount: 642,
    likeCount: 31,
    commentCount: 9,

    isLiked: false,
  },

  {
    id: 3,
    author: getMockUserSummary(7, 'personal'),
    createdAt: '2026-02-03',

    thumbnailUrl: '/mock/info-3.jpg',

    category: 'info',
    title: 'React Query와 Zustand 함께 사용할 때 상태 분리 기준',

    content: `<p>서버 상태와 클라이언트 상태를 어떤 기준으로 나누는지, 그리고 두 라이브러리를 함께 사용할 때의 패턴을 정리했습니다.</p>
<p></p>
<p>React Query는 서버에서 가져오는 데이터의 캐싱과 동기화에 강점이 있고, Zustand는 UI 상태나 전역 상태를 가볍게 관리하는 데 적합합니다.</p>
<p></p>
<p>두 가지를 함께 사용할 때는 서로의 역할을 명확히 구분하고, 불필요한 중복 상태를 만들지 않는 것이 중요합니다.</p>
`,

    tags: ['React Query', 'Zustand', '상태관리'],

    viewCount: 954,
    likeCount: 57,
    commentCount: 11,

    isLiked: false,
  },

  {
    id: 4,
    author: getMockUserSummary(5, 'personal'),
    createdAt: '2026-02-04',

    thumbnailUrl: '/mock/info-4.jpg',

    category: 'question',
    title: 'Tailwind CSS에서 디자인 시스템 컬러 관리 어떻게 하세요?',

    content: `<p>팔레트 토큰과 시멘틱 토큰을 어떻게 나누는지, 실무에서 어떤 방식이 유지보수에 좋은지 궁금합니다.</p>
`,

    tags: ['Tailwind', '디자인시스템', 'CSS'],

    viewCount: 488,
    likeCount: 22,
    commentCount: 6,

    isLiked: true,
  },

  {
    id: 5,
    author: getMockUserSummary(8, 'personal'),
    createdAt: '2026-02-05',

    thumbnailUrl: '/mock/info-5.jpg',

    category: 'info',
    title: '면접에서 자주 나오는 CS 질문 정리 (프론트엔드)',

    content: `<p>이벤트 루프, 클로저, 렌더링 과정 등 프론트엔드 면접에서 자주 등장하는 CS 질문들을 정리했습니다.</p>
<p>단순히 개념을 암기하는 것보다 실제 코드에서 어떻게 동작하는지를 이해하는 것이 중요합니다.</p>
<p>예를 들어 이벤트 루프는 비동기 코드 실행 흐름을 이해하는 데 필수적이며, 클로저는 상태를 유지하는 패턴에서 자주 활용됩니다.</p>
<p>이러한 개념들을 실제 사례와 함께 정리하면 면접에서 훨씬 자연스럽게 설명할 수 있습니다.</p>
`,

    tags: ['CS', '면접', 'JavaScript'],

    viewCount: 1720,
    likeCount: 103,
    commentCount: 25,

    isLiked: true,
  },

  {
    id: 6,
    author: getMockUserSummary(1, 'personal'),
    createdAt: '2026-02-06',

    thumbnailUrl: '/mock/info-6.jpg',

    category: 'question',
    title: 'Next.js에서 이미지 최적화 전략 어떻게 가져가시나요?',

    content: `<p>next/image 사용 시 성능 개선을 위해 어떤 옵션을 사용하는지, 그리고 CDN과 함께 사용할 때의 구조가 궁금합니다.</p>
`,

    tags: ['Next.js', '이미지최적화', '성능'],

    attachmentFileName: 'frontend-portfolio-guide.pdf',
    attachmentUrl: '/mock/mockFile.pdf',

    viewCount: 531,
    likeCount: 28,
    commentCount: 7,

    isLiked: true,
  },
];

export const infoComments: Comment[] = [
  {
    id: 1,
    author: getMockUserSummary(2, 'company'),
    content: '잘 보고 갑니다',
  },
  {
    id: 2,
    author: getMockUserSummary(3, 'personal'),
    content: '좋은 글 감사합니다',
  },
  {
    id: 3,
    author: getMockUserSummary(4, 'company'),
    content: '좋아요',
  },
  {
    id: 4,
    author: getMockUserSummary(5, 'personal'),
    content: '좋네요 수고요',
  },
  {
    id: 5,
    author: getMockUserSummary(10, 'company'),
    content:
      '좋은 글 감사합니다!\n\n실제 프로젝트를 진행하면서 비슷한 고민을 많이 했는데, 정리해주신 내용이 정말 도움이 됐어요. 특히 예시를 함께 설명해주셔서 이해하기 쉬웠습니다. 다음에도 좋은 글 기대하겠습니다 😊',
  },
  {
    id: 6,
    author: getMockUserSummary(1, 'personal'),
    content: '감사합니다 ^^',
  },
];

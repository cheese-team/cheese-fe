// 상단 탭 & 필터

export const COMMUNITY_CATEGORY_TABS = [
  { label: '채용공고', value: '/community/jobs' },
  { label: '그룹모집', value: '/community/groups' },
  { label: '정보/자료공유', value: '/community/info' },
];

export const COMMUNITY_SORT_OPTIONS = [
  { label: '최신순', value: 'latest' },
  { label: '마감일순', value: 'deadline' },
  { label: '좋아요순', value: 'like' },
];

export const INFO_SORT_OPTIONS = [
  { label: '전체', value: 'all' },
  { label: '질문글', value: 'question' },
  { label: '정보글', value: 'info' },
  { label: '자료공유', value: 'resource' },
];

// 게시글 상세 페이지

export const POST_CONTENT_CLASS = '[&_p]:m-0 [&_p]:min-h-6 [&_br]:block [&_br]:content-[""]';

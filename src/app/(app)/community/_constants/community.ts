import type { Option } from '@/types/option';

/* ================================
     커뮤니티 탭
   ================================ */
export const COMMUNITY_CATEGORY_TABS = [
  { label: '채용공고', value: '/community/jobs' },
  { label: '그룹모집', value: '/community/groups' },
  { label: '정보/자료공유', value: '/community/info' },
];

/* ================================
     커뮤니티 필터
   ================================ */

export type CommunitySort = 'latest' | 'deadline' | 'like';

export const COMMUNITY_SORT_OPTIONS: Option<CommunitySort>[] = [
  { label: '최신순', value: 'latest' },
  { label: '마감일순', value: 'deadline' },
  { label: '좋아요순', value: 'like' },
];

export type InfoSort = 'all' | 'question' | 'info' | 'resource';

export const INFO_SORT_OPTIONS: Option<InfoSort>[] = [
  { label: '전체', value: 'all' },
  { label: '질문글', value: 'question' },
  { label: '정보글', value: 'info' },
  { label: '자료공유', value: 'resource' },
];

export function isCommunitySort(value: string | null): value is CommunitySort {
  return COMMUNITY_SORT_OPTIONS.some((option) => option.value === value);
}

export function isInfoSort(value: string | null): value is InfoSort {
  return INFO_SORT_OPTIONS.some((option) => option.value === value);
}

/* ================================
     게시글 상세 페이지
   ================================ */
export const POST_CONTENT_CLASS = '[&_p]:m-0 [&_p]:min-h-6 [&_br]:block [&_br]:content-[""]';

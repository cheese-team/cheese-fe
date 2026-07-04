import type { ProblemMainCategory, ProblemSortValue, ProblemSubCategory } from '../_types/problem';

export const PROBLEM_SORT_OPTIONS = [
  { label: '최신순', value: 'latest' },
  { label: '진행일순', value: 'progressDate' },
  { label: '이름순', value: 'name' },
] as const satisfies readonly {
  label: string;
  value: ProblemSortValue;
}[];

export const PROBLEM_MAIN_CATEGORY_TABS = [
  { label: '전체', value: 'all' },
  { label: '프론트엔드', value: 'frontend' },
  { label: '백엔드', value: 'backend' },
  { label: 'CS', value: 'cs' },
] as const satisfies readonly {
  label: string;
  value: ProblemMainCategory;
}[];

export const PROBLEM_SUB_CATEGORY_TABS: Partial<
  Record<
    ProblemMainCategory,
    readonly {
      label: string;
      value: ProblemSubCategory;
    }[]
  >
> = {
  frontend: [
    { label: '전체', value: 'all' },
    { label: 'html/css', value: 'html-css' },
    { label: 'javascript', value: 'javascript' },
    { label: 'react', value: 'react' },
    { label: 'typescript', value: 'typescript' },
    { label: 'next.js', value: 'nextjs' },
  ],
  backend: [
    { label: '전체', value: 'all' },
    { label: 'java', value: 'java' },
    { label: 'MySQL', value: 'mysql' },
    { label: 'python', value: 'python' },
    { label: 'node.js', value: 'nodejs' },
  ],
};

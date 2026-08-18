import type { ProblemSet } from '../_types/problem';

import { mockProblemQuestions } from './mockProblemSolving';

const baseProblemSets: Omit<
  ProblemSet,
  'id' | 'lastProgressDate' | 'solvedCount' | 'totalCount'
>[] = [
  {
    title: 'CSS : 실무 신입 개발자가 알아야할 C언어',
    category: 'frontend',
    subCategory: 'html-css',
    badge: 'FE',
    thumbnailType: 'css',
    createdAt: '2026.01.20',
  },
  {
    title: 'CSS : 실무 신입 개발자가 알아야할 C언어',
    category: 'backend',
    subCategory: 'java',
    badge: 'BE',
    thumbnailType: 'html',
    createdAt: '2026.01.20',
  },
  {
    title: 'CSS : 실무 신입 개발자가 알아야할 C언어',
    category: 'cs',
    subCategory: 'network',
    badge: 'CS',
    thumbnailType: 'css',
    createdAt: '2026.01.20',
  },
  {
    title: 'CSS : 실무 신입 개발자가 알아야할 C언어',
    category: 'frontend',
    subCategory: 'javascript',
    badge: 'FE',
    thumbnailType: 'js',
    createdAt: '2026.01.20',
  },
  {
    title: 'CSS : 실무 신입 개발자가 알아야할 C언어',
    category: 'frontend',
    subCategory: 'javascript',
    badge: 'FE',
    thumbnailType: 'js',
    createdAt: '2026.01.20',
  },
  {
    title: 'CSS : 실무 신입 개발자가 알아야할 C언어',
    category: 'frontend',
    subCategory: 'html-css',
    badge: 'FE',
    thumbnailType: 'css',
    createdAt: '2026.01.20',
  },
  {
    title: 'CSS : 실무 신입 개발자가 알아야할 C언어',
    category: 'frontend',
    subCategory: 'html-css',
    badge: 'FE',
    thumbnailType: 'html',
    createdAt: '2026.01.20',
  },
  {
    title: 'CSS : 실무 신입 개발자가 알아야할 C언어',
    category: 'frontend',
    subCategory: 'html-css',
    badge: 'FE',
    thumbnailType: 'html',
    createdAt: '2026.01.20',
  },
  {
    title: 'CSS : 실무 신입 개발자가 알아야할 C언어',
    category: 'backend',
    subCategory: 'mysql',
    badge: 'BE',
    thumbnailType: 'js',
    createdAt: '2026.01.20',
  },
  {
    title: 'CSS : 실무 신입 개발자가 알아야할 C언어',
    category: 'backend',
    subCategory: 'nodejs',
    badge: 'BE',
    thumbnailType: 'html',
    createdAt: '2026.01.20',
  },
  {
    title: 'CSS : 실무 신입 개발자가 알아야할 C언어',
    category: 'frontend',
    subCategory: 'react',
    badge: 'FE',
    thumbnailType: 'css',
    createdAt: '2026.01.20',
  },
  {
    title: 'CSS : 실무 신입 개발자가 알아야할 C언어',
    category: 'frontend',
    subCategory: 'nextjs',
    badge: 'FE',
    thumbnailType: 'css',
    createdAt: '2026.01.20',
  },
];

export const mockProblemSets: ProblemSet[] = Array.from({ length: 60 }, (_, index) => {
  const baseProblemSet = baseProblemSets[index % baseProblemSets.length];

  return {
    ...baseProblemSet,
    id: `${baseProblemSet.category}-${baseProblemSet.subCategory}-${index + 1}`,
    lastProgressDate: null,
    solvedCount: 0,
    totalCount: mockProblemQuestions.length,
  };
});

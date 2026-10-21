import type { Metadata } from 'next';

import { LandingPage } from './_components/landing/LandingPage';

export const metadata: Metadata = {
  title: '치즈 | 취업 준비를 한 곳에서',
  description:
    '일정 관리, 메모, 문제풀이부터 커뮤니티까지. 취업 준비에 필요한 모든 기능을 치즈에서 만나보세요.',
};

export default function Home() {
  return <LandingPage />;
}

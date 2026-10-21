import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';

import { DashboardPreview, FeaturePreview } from './LandingPreview';
import type { FeatureName } from './LandingPreview';

const ACTION_STYLE =
  'h-[54px] rounded-[15px] px-6 py-3 text-[18px] leading-[30px] tracking-[-0.02em] transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-700 sm:h-[70px] sm:px-10 sm:py-5 sm:text-[24px]';

const FEATURES: {
  id: FeatureName;
  title: string;
  iconHeight: number;
  description: string[];
}[] = [
  {
    id: 'memo',
    title: '메모 기능',
    iconHeight: 16,
    description: [
      '메모가 필요한 순간, 놓치지 마세요.',
      '화면 우측 하단의 메모 위젯을 클릭하면 어느 페이지에서든 즉시 메모를 남길 수 있습니다. 빠르게 기록하고, 나중에 언제든 다시 꺼내볼 수 있어요.',
    ],
  },
  {
    id: 'calendar',
    title: '일정관리',
    iconHeight: 18,
    description: [
      '중요한 일정을 등록하면 메인 홈 화면에서 한눈에 확인할 수 있습니다.',
      '메모마다 색상을 자유롭게 설정할 수 있어 스터디, 면접, 개인 일정을 한 번에 깔끔하게 구분해 관리해 보세요.',
    ],
  },
  {
    id: 'problem',
    title: '문제풀이',
    iconHeight: 18,
    description: [
      '취업 준비, 막막하게 혼자 하지 않아도 됩니다. 면접 대비 질문부터 실전 개발 문제까지, 주니어 개발자에게 꼭 필요한 학습 콘텐츠를 제공합니다. 매일 꾸준히 풀다 보면 어느새 실력이 쌓여 있을 거예요.',
    ],
  },
  {
    id: 'community',
    title: '커뮤니티',
    iconHeight: 15,
    description: [
      '혼자보다 함께할 때 더 빨리 성장합니다. 최신 채용 공고 탐색부터 스터디 그룹 모집, 개발 정보 공유까지 같은 목표를 가진 동료들과 연결되어 취업 여정을 함께 만들어 가세요.',
    ],
  },
];

function CommunityInvitation() {
  return (
    <div className="flex flex-wrap items-center gap-4 py-2">
      <div className="flex -space-x-3" aria-hidden="true">
        {[1, 2, 3].map((member) => (
          <Image
            key={member}
            src={`/images/landing/member-${member}.png`}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full border-2 border-white"
          />
        ))}
        <span className="bg-secondary-600 relative flex size-10 items-center justify-center rounded-full border-2 border-white text-[10px] leading-[15px] font-bold text-white">
          +10k
        </span>
      </div>
      <Link
        href="/signup"
        prefetch={false}
        className="focus-visible:outline-secondary-700 rounded text-[14px] leading-5 font-medium text-[#64748b] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        지금 가입해서 함께하세요!
      </Link>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="bg-white pb-px text-gray-950">
      <section
        aria-labelledby="landing-title"
        className="flex flex-col items-center gap-14 bg-[linear-gradient(180deg,#fff_66.346%,var(--color-secondary-100)_100%)] px-6 py-20 lg:gap-[100px] lg:py-[105.5px]"
      >
        <div className="flex w-full flex-col items-center gap-8 text-center">
          <h1
            id="landing-title"
            className="text-[36px] leading-[1.25] font-bold tracking-[-0.05em] break-keep sm:text-[52px] lg:text-[64px] xl:text-[80px] xl:leading-[100px]"
          >
            취업 준비를 한 곳에서 관리하세요.
          </h1>
          <p className="max-w-[1200px] text-[18px] leading-8 font-medium tracking-[-0.05em] break-keep sm:text-[20px] xl:text-[24px]">
            일정 관리, 문제풀이, 채용정보 그리고 함께 준비할 사람들까지, 취업준비에 필요한 모든
            기능을 제공합니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
            <Button asChild className={cn(ACTION_STYLE, 'gap-2 font-bold sm:w-[227.45px]')}>
              <Link href="/login" prefetch={false}>
                치즈 사용하기
                <Image
                  src="/images/landing/chevron.svg"
                  alt=""
                  width={12}
                  height={20}
                  className="h-5 w-auto -scale-x-100"
                />
              </Link>
            </Button>
            <Button
              asChild
              variant="outlinePrimary"
              className={cn(ACTION_STYLE, 'border-2 sm:w-[188px]')}
            >
              <a href="#features">더 알아보기</a>
            </Button>
          </div>
        </div>
        <DashboardPreview />
      </section>

      <section
        id="features"
        aria-labelledby="features-title"
        className="mx-auto max-w-[1352px] scroll-mt-8 px-6 py-16 lg:py-20"
      >
        <h2
          id="features-title"
          className="mb-12 text-[32px] leading-[1.35] font-bold tracking-[-0.05em] break-keep sm:text-[44px] lg:mb-20 xl:text-[60px] xl:leading-[100px]"
        >
          <span className="from-primary-800 to-secondary-600 bg-gradient-to-r bg-clip-text text-transparent">
            치즈
          </span>
          {' 에는 어떤 기능들이 있나요?'}
        </h2>
        <div className="space-y-20 lg:space-y-32 xl:px-6">
          {FEATURES.map((feature, index) => (
            <article
              key={feature.id}
              aria-labelledby={`feature-${feature.id}`}
              className={cn(
                'grid items-start gap-8 tracking-normal lg:grid-cols-2 lg:gap-12',
                index % 2 === 0
                  ? 'xl:grid-cols-[minmax(0,1fr)_minmax(0,600px)]'
                  : 'xl:grid-cols-[minmax(0,600px)_minmax(0,1fr)]',
              )}
            >
              <div
                className={cn(
                  'flex min-w-0 flex-col items-start gap-6',
                  index % 2 === 1 && 'lg:order-last',
                )}
              >
                <div className="bg-primary-200 flex size-12 items-center justify-center rounded-[10px]">
                  <Image
                    src={`/images/landing/${feature.id}.svg`}
                    alt=""
                    width={16}
                    height={feature.iconHeight}
                    className="h-auto w-4"
                  />
                </div>
                <h3 id={`feature-${feature.id}`} className="text-[30px] leading-9 font-bold">
                  {feature.title}
                </h3>
                <div className="text-[18px] leading-[29.25px] font-medium text-gray-700">
                  {feature.description.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {feature.id === 'community' && <CommunityInvitation />}
              </div>
              <FeaturePreview feature={feature.id} />
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="signup-title"
        className="bg-primary-100 flex flex-col items-center gap-8 px-6 py-20 text-center"
      >
        <h2
          id="signup-title"
          className="text-[32px] leading-[1.35] font-bold tracking-[-0.05em] break-keep sm:text-[44px] xl:text-[60px] xl:leading-[100px]"
        >
          지금 무료로 체험해보세요
        </h2>
        <div className="flex flex-wrap justify-center gap-5">
          <Button asChild className={cn(ACTION_STYLE, 'font-bold sm:w-[162px]')}>
            <Link href="/signup" prefetch={false}>
              회원가입
            </Link>
          </Button>
          <Button asChild className={cn(ACTION_STYLE, 'bg-bg-3 text-gray-950 sm:w-[142px]')}>
            <Link href="/login" prefetch={false}>
              로그인
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

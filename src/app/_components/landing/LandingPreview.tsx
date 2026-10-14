import Image from 'next/image';

import { cn } from '@/lib/cn';

export type FeatureName = 'memo' | 'calendar' | 'problem' | 'community';

const PREVIEW_DETAILS: Record<FeatureName, { background: string; label: string }> = {
  memo: { background: 'bg-tag-yellow-200', label: '메모 위젯과 저장된 메모 목록 예시' },
  calendar: { background: 'bg-tag-green-200', label: '월별 캘린더와 일정 등록 화면 예시' },
  problem: {
    background: 'bg-tag-blue-200',
    label: '문제별 정답 여부와 소요 시간을 보여주는 풀이 결과 예시',
  },
  community: { background: 'bg-tag-purple-200', label: '스터디 그룹 모집 게시글 예시' },
};

const FEATURE_IMAGE_SIZES =
  '(max-width: 639px) calc(100vw - 48px), (max-width: 1023px) 600px, (max-width: 1279px) 50vw, 600px';

export function DashboardPreview() {
  return (
    <div
      role="img"
      aria-label="일정, 문제집, 커뮤니티 게시글을 한눈에 보여주는 치즈 홈 화면 예시"
      className="relative aspect-[907/503] w-full max-w-[907px] overflow-hidden rounded-[24px] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border-x-2 before:border-t-2 before:border-white before:bg-gray-950 before:bg-clip-padding"
    >
      <div className="absolute top-1/2 left-1/2 h-[94.2346%] w-[95.9206%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[16px]">
        <Image
          src="/images/landing/dashboard-background.png"
          alt=""
          fill
          sizes="(max-width: 955px) calc(100vw - 48px), 870px"
        />
        <Image
          src="/images/landing/dashboard.png"
          alt=""
          width={3841}
          height={2161}
          sizes="(max-width: 955px) calc(100vw - 48px), 870px"
          priority
          unoptimized
          className="relative h-auto w-full"
        />
      </div>
    </div>
  );
}

export function FeaturePreview({ feature }: { feature: FeatureName }) {
  const { background, label } = PREVIEW_DETAILS[feature];

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'relative mx-auto aspect-[2/1] w-full max-w-[600px] overflow-hidden rounded-[15px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-gray-400',
        background,
      )}
    >
      {feature === 'memo' && (
        <>
          <div className="absolute top-[10.2533%] left-[57.06%] h-[120.978%] w-[38.8367%] shadow-[0_4px_20px_rgba(85,85,85,0.2)]">
            <Image
              src="/images/landing/memo-list.png"
              alt=""
              fill
              unoptimized
              sizes="233px"
              className="object-cover"
            />
          </div>
          <div className="absolute top-[-11.3333%] left-[-63%] h-[92%] w-[97%] overflow-hidden rounded-[15px] bg-white shadow-[0_4px_20px_rgba(85,85,85,0.2)]">
            <div className="absolute top-[-46.0145%] left-[-6.4433%] h-[146.0145%] w-[106.4433%]">
              <Image
                src="/images/landing/memo-widget.png"
                alt=""
                fill
                unoptimized
                sizes={FEATURE_IMAGE_SIZES}
                className="object-cover"
              />
            </div>
          </div>
        </>
      )}
      {feature === 'calendar' && (
        <>
          <div className="absolute top-[7.3333%] left-[52.6667%] h-[109.2567%] w-[38.7363%] overflow-hidden rounded-[15px]">
            <Image
              src="/images/landing/calendar-event.png"
              alt=""
              fill
              unoptimized
              sizes="232px"
              className="object-contain"
            />
          </div>
          <div className="absolute top-[-4.6667%] left-[-59%] h-[108.6667%] w-[97%] overflow-hidden rounded-[15px] bg-white shadow-[0_4px_20px_rgba(85,85,85,0.2)]">
            <div className="absolute top-[-2.5153%] left-[-6.4433%] h-[123.6196%] w-[106.4433%]">
              <Image
                src="/images/landing/calendar-month.png"
                alt=""
                fill
                unoptimized
                sizes={FEATURE_IMAGE_SIZES}
                className="object-cover"
              />
            </div>
          </div>
        </>
      )}
      {feature === 'problem' && (
        <div className="absolute top-[-0.3333%] left-[7.8333%] h-[109.288%] w-[84%] overflow-hidden bg-white shadow-[0_3.458px_21.613px_rgba(85,85,85,0.25)]">
          <Image
            src="/images/landing/problem-results.png"
            alt=""
            fill
            unoptimized
            sizes={FEATURE_IMAGE_SIZES}
          />
        </div>
      )}
      {feature === 'community' && (
        <div className="absolute top-1/2 left-1/2 h-[86.6667%] w-[91.6667%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[15px] bg-white shadow-[0_4px_20px_rgba(85,85,85,0.2)]">
          <div className="absolute top-0 left-[-9.0655%] h-[162.5615%] w-[118.1311%]">
            <Image
              src="/images/landing/community-post.png"
              alt=""
              fill
              unoptimized
              sizes={FEATURE_IMAGE_SIZES}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

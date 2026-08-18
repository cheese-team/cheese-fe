'use client';

import ProfileImage from '@/components/common/ProfileImage';

import { useCalendarStore } from '@/app/(app)/calendar/_store/CalendarStoreProvider';

import { getBusiestWeekdayLabel, getThisWeekRemainingEvents } from '../_lib/events';

import { getMockPersonalProfile } from '@/mocks/profile/userProfiles';

export default function DashboardGreetingSection() {
  const profile = getMockPersonalProfile(1);
  const { events } = useCalendarStore();

  const remainingThisWeek = getThisWeekRemainingEvents(events).length;
  const busiestWeekday = getBusiestWeekdayLabel(events);

  return (
    <section className="flex items-center justify-center gap-5 py-5">
      <ProfileImage src={profile.profileImageUrl} size={40} />

      <div className="flex min-w-0 flex-col gap-1 text-left">
        <h1 className="text-[24px] leading-[30px] font-medium">
          반갑습니다 {profile.nickname}님, 이번주 남은 일정이{' '}
          <span className="text-secondary-800 text-[28px] font-bold">{remainingThisWeek}</span>개
          있어요
        </h1>

        <p className="text-[16px] leading-[30px] font-medium text-gray-600">
          {busiestWeekday ? (
            <>이 주에 가장 많은 일정이 있는 날은 {busiestWeekday}이에요</>
          ) : (
            <>일정을 확인하고 이번 주를 준비해 보세요</>
          )}
        </p>
      </div>
    </section>
  );
}

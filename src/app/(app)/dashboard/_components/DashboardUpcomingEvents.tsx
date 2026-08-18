'use client';

import { useState } from 'react';
import Link from 'next/link';

import DashboardCarouselNavButton from './DashboardCarouselNavButton';
import DashboardEventCard from './DashboardEventCard';
import DashboardSectionHeader from './DashboardSectionHeader';

import { useCalendarStore } from '@/app/(app)/calendar/_store/CalendarStoreProvider';

import { getUpcomingEvents } from '../_lib/events';

import { CalendarIcon } from '@/assets/icons/sidebar';

const EVENT_CARD_WIDTH = 312;
const EVENT_CARD_GAP = 12;
const EVENT_CARD_SCROLL_STEP = EVENT_CARD_WIDTH + EVENT_CARD_GAP;
const EVENT_CARD_VISIBLE_COUNT = 3;

export function getEventCarouselMaxStartIndex(totalCount: number) {
  return Math.max(0, totalCount - EVENT_CARD_VISIBLE_COUNT);
}

export default function DashboardUpcomingEvents() {
  const { events } = useCalendarStore();
  const upcomingEvents = getUpcomingEvents(events);
  const [startIndex, setStartIndex] = useState(0);

  const maxStartIndex = getEventCarouselMaxStartIndex(upcomingEvents.length);
  const visibleStartIndex = Math.min(startIndex, maxStartIndex);

  const canGoPrev = visibleStartIndex > 0;
  const canGoNext = visibleStartIndex < maxStartIndex;

  const handlePrev = () => {
    setStartIndex(Math.max(0, visibleStartIndex - 1));
  };

  const handleNext = () => {
    setStartIndex(Math.min(maxStartIndex, visibleStartIndex + 1));
  };

  return (
    <section>
      <DashboardSectionHeader icon={<CalendarIcon />} title="다가오는 일정" />

      {upcomingEvents.length > 0 ? (
        <div className="group relative w-full overflow-visible">
          <div className="overflow-hidden">
            <div
              className="flex gap-3 transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${visibleStartIndex * EVENT_CARD_SCROLL_STEP}px)`,
              }}
            >
              {upcomingEvents.map((event) => (
                <div key={event.id} className="w-[312px] shrink-0">
                  <DashboardEventCard event={event} />
                </div>
              ))}
            </div>
          </div>

          {canGoPrev ? (
            <DashboardCarouselNavButton
              label="이전 일정 보기"
              direction="left"
              onClick={handlePrev}
            />
          ) : null}

          {canGoNext ? (
            <DashboardCarouselNavButton
              label="다음 일정 보기"
              direction="right"
              onClick={handleNext}
            />
          ) : null}
        </div>
      ) : (
        <div className="border-border flex min-h-[188px] flex-col items-center justify-center rounded-[10px] border bg-white p-8 text-center">
          <p className="text-text-muted text-[15px] leading-[22px] font-medium">
            다가오는 일정이 없습니다.
          </p>

          <Link
            href="/calendar"
            className="mt-3 text-[15px] leading-[22px] font-medium hover:underline"
          >
            일정 추가하러 가기
          </Link>
        </div>
      )}
    </section>
  );
}

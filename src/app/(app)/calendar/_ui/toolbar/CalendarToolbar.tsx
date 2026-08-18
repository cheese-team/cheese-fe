'use client';

import { ChevronIcon } from '../../../../../assets/icons/calendar';
import type { CalendarView } from '../../_model/types';
import { CalendarViewSwitcher } from './CalendarViewSwitcher';

type Props = {
  view: CalendarView;
  title: string;
  onChangeView: (next: CalendarView) => void;
  onClickToday: () => void;
  onClickPrev: () => void;
  onClickNext: () => void;
};

export function CalendarToolbar({
  view,
  title,
  onChangeView,
  onClickToday,
  onClickPrev,
  onClickNext,
}: Props) {
  const prevDirection = view === 'day' ? 'left' : 'up';
  const nextDirection = view === 'day' ? 'right' : 'down';

  return (
    <header className="bg-bg-white flex h-[64px] items-center justify-between px-8 pt-[10px]">
      <h2 className="text-2xl leading-[30px] font-bold tracking-normal text-gray-700">{title}</h2>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onClickToday}
            className="bg-bg-white hover:bg-bg-2 flex h-8 w-[60px] items-center justify-center rounded-[13px] border border-gray-300 text-[14px] leading-[20px] font-medium tracking-normal text-gray-700 transition outline-none"
          >
            오늘
          </button>

          <button
            type="button"
            onClick={onClickPrev}
            aria-label="이전"
            className="bg-bg-white hover:bg-bg-2 flex h-8 w-10 items-center justify-center rounded-[13px] border border-gray-300 text-gray-500 transition outline-none"
          >
            <ChevronIcon direction={prevDirection} width={14} className="block" />
          </button>

          <button
            type="button"
            onClick={onClickNext}
            aria-label="다음"
            className="bg-bg-white hover:bg-bg-2 flex h-8 w-10 items-center justify-center rounded-[13px] border border-gray-300 text-gray-500 transition outline-none"
          >
            <ChevronIcon direction={nextDirection} width={14} className="block" />
          </button>
        </div>

        <CalendarViewSwitcher value={view} onChange={onChangeView} />
      </div>
    </header>
  );
}

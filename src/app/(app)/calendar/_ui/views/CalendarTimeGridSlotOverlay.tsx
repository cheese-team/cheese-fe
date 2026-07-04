'use client';

import { formatEnglishHourLabel, formatKoreanWeekday } from '../../_lib/date';
import { TIMEGRID_SLOT_COUNT } from './calendar-core.constants';

type Props = {
  date: Date;
  onClickSlot: (date: Date, slotButton: HTMLButtonElement) => void;
};

/**
 * 주간/일간 화면에서 시간 슬롯 전체를 클릭 가능한 오버레이로 만든다.
 * 슬롯마다 버튼을 따로 두어 어느 시간대를 눌렀는지 명확하게 전달한다.
 */
export function CalendarTimeGridSlotOverlay({ date, onClickSlot }: Props) {
  const baseDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return (
    <div className="calendar-timegrid-slot-overlay">
      <div className="calendar-timegrid-slot-overlay__grid">
        {Array.from({ length: TIMEGRID_SLOT_COUNT }, (_, hour) => {
          const slotDate = new Date(
            baseDate.getFullYear(),
            baseDate.getMonth(),
            baseDate.getDate(),
            hour,
            0,
            0,
            0,
          );

          return (
            <button
              key={`${date.toISOString()}-${hour}`}
              type="button"
              tabIndex={-1}
              className="calendar-timegrid-slot-overlay__button"
              aria-label={`${formatKoreanWeekday(baseDate)} ${baseDate.getDate()}일 ${formatEnglishHourLabel(
                slotDate,
              )}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClickSlot(slotDate, event.currentTarget);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

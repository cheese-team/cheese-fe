'use client';

import type { CalendarEvent } from '../../_model/types';

type Props = {
  events: CalendarEvent[];
  onCreateClick?: () => void;
};

export function CalendarSidebar({ events, onCreateClick }: Props) {
  return (
    <div className="border-border bg-bg-white h-full rounded-2xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-base font-semibold">일정</div>
        <button
          type="button"
          onClick={onCreateClick}
          className="border-border hover:bg-bg-2 h-9 rounded-xl border px-3 text-sm"
        >
          추가
        </button>
      </div>

      <div className="text-text-muted text-sm">총 {events.length}개</div>
    </div>
  );
}

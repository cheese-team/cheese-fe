'use client';

import { useEffect, useMemo, useState } from 'react';

import type { CalendarEventDraft, ReminderMinutes } from '../../_model/types';
import { mockSpaces } from '../../_model/mock-spaves';

type Props = {
  initialValue: CalendarEventDraft;
  onCancel: () => void;
  onSubmit: (nextDraft: CalendarEventDraft) => void;
};

function toInputDateTime(value: string) {
  // ISO string -> "YYYY-MM-DDTHH:mm"
  // (브라우저 input[type=datetime-local] 규격)
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function fromInputDateTime(value: string) {
  // "YYYY-MM-DDTHH:mm" -> ISO string
  const d = new Date(value);
  return d.toISOString();
}

const reminderOptions: Array<{ label: string; value: ReminderMinutes }> = [
  { label: '없음', value: 0 },
  { label: '5분 전', value: 5 },
  { label: '10분 전', value: 10 },
  { label: '15분 전', value: 15 },
  { label: '30분 전', value: 30 },
  { label: '1시간 전', value: 60 },
  { label: '2시간 전', value: 120 },
  { label: '하루 전', value: 1440 },
];

export default function EventForm({ initialValue, onCancel, onSubmit }: Props) {
  const [value, setValue] = useState<CalendarEventDraft>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // 공간 옵션(지금은 mock)
  const spaces = useMemo(() => mockSpaces, []);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();

        const title = (value.title ?? '').trim();
        if (!title) return; // 최소 validation: 제목 필수

        onSubmit({
          ...value,
          title,
          colorId: value.colorId,
          reminderMinutes: value.reminderMinutes ?? 0,
        });
      }}
    >
      {/* 제목 */}
      <label className="flex flex-col gap-1">
        <span className="text-text-muted text-sm">제목</span>
        <input
          className="border-border bg-bg-white h-10 rounded-xl border px-3"
          placeholder="일정 제목"
          value={value.title ?? ''}
          onChange={(e) => setValue((p) => ({ ...p, title: e.target.value }))}
        />
      </label>

      {/* 시작/종료 */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-text-muted text-sm">시작</span>
          <input
            type="datetime-local"
            className="border-border bg-bg-white h-10 rounded-xl border px-3"
            value={toInputDateTime(value.start)}
            onChange={(e) => setValue((p) => ({ ...p, start: fromInputDateTime(e.target.value) }))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-text-muted text-sm">종료</span>
          <input
            type="datetime-local"
            className="border-border bg-bg-white h-10 rounded-xl border px-3"
            value={toInputDateTime(value.end)}
            onChange={(e) => setValue((p) => ({ ...p, end: fromInputDateTime(e.target.value) }))}
          />
        </label>
      </div>

      {/* 공간(일정공간구분) */}
      <label className="flex flex-col gap-1">
        <span className="text-text-muted text-sm">일정 공간</span>
        <select
          className="border-border bg-bg-white h-10 rounded-xl border px-3"
          value={value.spaceId ?? ''}
          onChange={(e) => setValue((p) => ({ ...p, spaceId: e.target.value || undefined }))}
        >
          <option value="">선택 안 함</option>
          {spaces.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      {/* 리마인더 */}
      <label className="flex flex-col gap-1">
        <span className="text-text-muted text-sm">리마인더</span>
        <select
          className="border-border bg-bg-white h-10 rounded-xl border px-3"
          value={value.reminderMinutes ?? 0}
          onChange={(e) =>
            setValue((p) => ({
              ...p,
              reminderMinutes: Number(e.target.value) as ReminderMinutes,
            }))
          }
        >
          {reminderOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {/* 메모 */}
      <label className="flex flex-col gap-1">
        <span className="text-text-muted text-sm">메모</span>
        <textarea
          className="bg-bg-white border-border min-h-[96px] resize-none rounded-xl border px-3 py-2"
          placeholder="메모"
          value={value.memo ?? ''}
          onChange={(e) => setValue((p) => ({ ...p, memo: e.target.value }))}
        />
      </label>

      {/* 버튼 */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          className="border-border hover:bg-bg-2 h-10 rounded-xl border px-4"
          onClick={onCancel}
        >
          취소
        </button>
        <button type="submit" className="bg-primary-800 text-text h-10 rounded-xl px-4">
          저장
        </button>
      </div>
    </form>
  );
}

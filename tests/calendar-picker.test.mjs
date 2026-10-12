import assert from 'node:assert/strict';
import { test } from 'node:test';

import { formatCalendarDate } from '../src/app/(app)/calendar/_lib/date.ts';
import {
  getMonthDays,
  getTimeLabel,
  getTimeParts,
  moveMonth,
  to24HourTime,
} from '../src/app/(app)/calendar/_ui/popover/calendar-picker.utils.ts';

test('날짜 선택: 이전·다음 달을 포함한 6주를 일요일부터 표시한다', () => {
  const days = getMonthDays(new Date(2026, 9, 8));
  assert.equal(days.length, 42);
  assert.equal(formatCalendarDate(days[0]), '2026-09-27');
  assert.equal(formatCalendarDate(days[41]), '2026-11-07');
  days.forEach((day, index) => assert.equal(day.getDay(), index % 7));
});

for (const [date, amount, expected] of [
  [new Date(2024, 0, 31), 1, '2024-02-29'],
  [new Date(2026, 2, 31), -1, '2026-02-28'],
  [new Date(2026, 11, 31), 1, '2027-01-31'],
]) {
  test(`날짜 선택: 월 이동 시 월말·윤년·연도 경계를 처리한다 (${expected})`, () => {
    const original = date.getTime();
    assert.equal(formatCalendarDate(moveMonth(date, amount)), expected);
    assert.equal(date.getTime(), original);
  });
}

for (const [time, period, hour, minute, label] of [
  ['00:00', '오전', '12', '00', '오전 12:00'],
  ['12:00', '오후', '12', '00', '오후 12:00'],
  ['09:07', '오전', '09', '07', '오전 9:07'],
  ['23:59', '오후', '11', '59', '오후 11:59'],
]) {
  test(`시간 선택: ${time}을 표시하고 저장할 때 같은 시간을 유지한다`, () => {
    assert.deepEqual(getTimeParts(time), { period, hour, minute });
    assert.equal(to24HourTime(period, hour, minute), time);
    assert.equal(getTimeLabel(time), label);
  });
}

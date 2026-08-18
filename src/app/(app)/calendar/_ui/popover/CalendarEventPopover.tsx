'use client';

import { useEffect, useRef } from 'react';

import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { CollapsibleColorPicker } from '@/components/common/CollapsibleColorPicker';

import { cn } from '@/lib/cn';
import { getTagColor } from '@/lib/tagPalette';
import {
  addDaysToCalendarDate,
  addHoursToCalendarDateTime,
  combineDateAndTime,
  formatDisplayDate,
  hasTimePart,
  parseCalendarDate,
  toDateInputValue,
  toTimeInputValue,
} from '../../_lib/date';

import CheckboxIcon from '@/assets/icons/calendar/checkbox.svg';
import DateIcon from '@/assets/icons/calendar/calendar.svg';
import RangeSeparatorIcon from '@/assets/icons/calendar/range-separator.svg';
import ThinCloseIcon from '@/assets/icons/calendar/thinclose.svg';
import WatchIcon from '@/assets/icons/calendar/watch.svg';
import Watch2Icon from '@/assets/icons/calendar/watch2.svg';
import LinkIcon from '@/assets/icons/common/link.svg';
import LocationIcon from '@/assets/icons/settings/location.svg';

import type {
  CalendarEventCategory,
  CalendarEventDraft,
  EventColorId,
  ReminderMinutes,
} from '../../_model/types';

import type { Option } from '@/types/option';

type CalendarEventPopoverProps = {
  open: boolean;
  x: number;
  y: number;
  draft: CalendarEventDraft;
  hideTimeFields?: boolean;
  onChangeDraft: (nextDraft: CalendarEventDraft) => void;
  onClose: () => void;
  onCommit: () => void;
};

const REMINDER_OPTIONS: Option[] = [
  { label: '5분 전', value: '5' },
  { label: '10분 전', value: '10' },
  { label: '30분 전', value: '30' },
  { label: '1시간 전', value: '60' },
];

function isReminderMinutes(value: number): value is ReminderMinutes {
  return [5, 10, 30, 60].includes(value);
}

const CATEGORY_OPTIONS: Option[] = [
  { label: '면접일정', value: 'interview' },
  { label: '서류접수', value: 'document' },
  { label: '개인일정', value: 'personal' },
  { label: '기타', value: 'etc' },
];

const DATE_TIME_TEXT_CLASS_NAME = 'text-[14px] leading-[17px] font-normal tracking-normal';
const COMPACT_INPUT_TEXT_CLASS_NAME = 'text-[14px] leading-[17px] font-normal tracking-[-0.02em]';
const COMPACT_SELECT_TRIGGER_CLASS_NAME = cn(
  DATE_TIME_TEXT_CLASS_NAME,
  'h-[29px] rounded-[5px] border-0 bg-white px-2 ring-1 ring-gray-300 ring-inset',
  'text-gray-700',
  'data-[placeholder]:text-gray-500',
  'data-[state=open]:rounded-[5px]',
  'data-[state=open]:border-0',
  'data-[state=open]:px-2',
);

const QUICK_EVENT_COLOR_IDS = [
  'tag-gray',
  'tag-red',
  'tag-yellow',
  'tag-green',
  'tag-blue',
  'tag-purple',
] as const satisfies readonly EventColorId[];

const QUICK_EVENT_COLORS = QUICK_EVENT_COLOR_IDS.map((id) => ({
  ...getTagColor(id),
  id,
}));

const QUICK_EVENT_COLOR_OPTIONS = QUICK_EVENT_COLORS.map((color) => ({
  value: color.id,
  label: color.label,
  swatchClassName: color.chipClassName,
}));

function ScheduleFieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center text-gray-400">
      {children}
    </span>
  );
}

function CompactFieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-3 w-3 shrink-0 items-center justify-center text-gray-400">
      {children}
    </span>
  );
}

type DisplayDateFieldProps = {
  value?: string;
  onChange: (nextValue: string) => void;
};

function DisplayDateField({ value, onChange }: DisplayDateFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const displayText = formatDisplayDate(value);
  const inputValue = toDateInputValue(value);

  const openPicker = () => {
    if (!inputRef.current) return;

    if ('showPicker' in HTMLInputElement.prototype) {
      (inputRef.current as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
      return;
    }

    inputRef.current.click();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openPicker}
        className={cn(
          'flex h-[25px] w-full items-center justify-center rounded-[5px] border border-gray-300 bg-white px-5 text-gray-700',
          DATE_TIME_TEXT_CLASS_NAME,
        )}
      >
        <span className="whitespace-nowrap">{displayText}</span>
      </button>

      <input
        ref={inputRef}
        type="date"
        value={inputValue}
        onChange={(event) => onChange(event.target.value)}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        tabIndex={-1}
      />
    </div>
  );
}

type DisplayTimeFieldProps = {
  value?: string;
  onChange: (nextValue: string) => void;
};

function formatDisplayTime(value?: string) {
  const inputValue = toTimeInputValue(value);
  if (!inputValue) return '시간 선택';

  const [hourText = '0', minute = '00'] = inputValue.split(':');
  const hour = Number(hourText);
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 || 12;

  return `${period} ${displayHour}:${minute}`;
}

function DisplayTimeField({ value, onChange }: DisplayTimeFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputValue = toTimeInputValue(value);

  const openPicker = () => {
    if (!inputRef.current) return;

    if ('showPicker' in HTMLInputElement.prototype) {
      (inputRef.current as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
      return;
    }

    inputRef.current.click();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openPicker}
        className={cn(
          'flex h-[25px] w-full items-center justify-center rounded-[5px] border border-gray-300 bg-white px-5 text-gray-700',
          DATE_TIME_TEXT_CLASS_NAME,
        )}
      >
        <span className="truncate">{formatDisplayTime(value)}</span>
      </button>

      <input
        ref={inputRef}
        type="time"
        value={inputValue}
        onChange={(event) => onChange(event.target.value)}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        tabIndex={-1}
      />
    </div>
  );
}

function getAllDayDisplayEndValue(start?: string, end?: string) {
  if (!start) return '';
  if (!end) return start;

  const inclusiveEnd = addDaysToCalendarDate(end, -1);

  return inclusiveEnd || start;
}

export function CalendarEventPopover({
  open,
  x,
  y,
  draft,
  hideTimeFields = false,
  onChangeDraft,
  onClose,
  onCommit,
}: CalendarEventPopoverProps) {
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const isAllDay = draft.allDay ?? !hasTimePart(draft.start);
  const showDateOnlyTimedField = hideTimeFields && !isAllDay;
  const timedStartDateValue = toDateInputValue(draft.start);
  const timedStartTimeValue = toTimeInputValue(draft.start) || '09:00';
  const timedEndTimeValue =
    toTimeInputValue(draft.end || addHoursToCalendarDateTime(draft.start, 1)) || '10:00';
  const allDayDisplayEndValue = getAllDayDisplayEndValue(draft.start, draft.end);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const handleClosePopover = () => {
    onClose();
  };

  const handleSelectColor = (colorId: EventColorId) => {
    onChangeDraft({
      ...draft,
      colorId,
    });
  };

  const updateAllDayStart = (nextStart: string) => {
    const currentDisplayEnd = getAllDayDisplayEndValue(draft.start, draft.end) || nextStart;
    const currentEndDate = parseCalendarDate(currentDisplayEnd);
    const nextStartDate = parseCalendarDate(nextStart);

    const nextDisplayEnd =
      currentEndDate && nextStartDate && currentEndDate >= nextStartDate
        ? currentDisplayEnd
        : nextStart;

    onChangeDraft({
      ...draft,
      allDay: true,
      start: nextStart,
      end: addDaysToCalendarDate(nextDisplayEnd, 1),
    });
  };

  const updateAllDayEnd = (nextEnd: string) => {
    onChangeDraft({
      ...draft,
      allDay: true,
      end: addDaysToCalendarDate(nextEnd || draft.start, 1),
    });
  };

  const updateTimedStart = (nextDate: string, nextTime: string) => {
    const nextStart = combineDateAndTime(nextDate, nextTime);
    if (!nextStart) return;

    const nextEnd =
      combineDateAndTime(nextDate, timedEndTimeValue) || addHoursToCalendarDateTime(nextStart, 1);

    onChangeDraft({
      ...draft,
      allDay: false,
      start: nextStart,
      end: nextEnd,
    });
  };

  const updateTimedEnd = (nextTime: string) => {
    const nextEnd = combineDateAndTime(timedStartDateValue, nextTime);
    if (!nextEnd) return;

    onChangeDraft({
      ...draft,
      allDay: false,
      end: nextEnd,
    });
  };

  const updateTimedDateOnlyDraft = (nextDate: string) => {
    const nextStart = combineDateAndTime(nextDate, timedStartTimeValue);
    if (!nextStart) return;

    const nextEnd =
      combineDateAndTime(nextDate, timedEndTimeValue) || addHoursToCalendarDateTime(nextStart, 1);

    onChangeDraft({
      ...draft,
      allDay: false,
      start: nextStart,
      end: nextEnd,
    });
  };

  const handleToggleAllDay = () => {
    const nextAllDay = !isAllDay;
    const dateValue = toDateInputValue(draft.start);

    if (!dateValue) return;

    if (nextAllDay) {
      onChangeDraft({
        ...draft,
        allDay: true,
        start: dateValue,
        end: addDaysToCalendarDate(dateValue, 1),
      });
      return;
    }

    const nextStart = combineDateAndTime(dateValue, '22:00');
    const nextEnd = combineDateAndTime(dateValue, '23:30');

    if (!nextStart || !nextEnd) return;

    onChangeDraft({
      ...draft,
      allDay: false,
      start: nextStart,
      end: nextEnd,
    });
  };

  if (!open) return null;

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-transparent"
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onCommit();
        }}
      />

      <div
        ref={popoverRef}
        role="dialog"
        aria-modal="true"
        aria-label="일정"
        className="fixed z-50 flex w-[301px] flex-col items-start gap-[20px] overflow-visible rounded-[10px] bg-white px-4 py-5 shadow-[0_4px_20px_rgba(85,85,85,0.2)] ring-1 ring-gray-400 ring-inset"
        style={{ left: x, top: y }}
      >
        <div className="flex h-[14px] w-full items-center justify-between">
          <span className="text-[12px] leading-[14px] font-medium tracking-normal text-gray-950">
            일정
          </span>

          <button
            type="button"
            onClick={handleClosePopover}
            className="flex h-3 w-3 items-center justify-center"
            aria-label="닫기"
          >
            <ThinCloseIcon width={10} height={10} aria-hidden="true" />
          </button>
        </div>

        <Input
          label="일정 제목"
          value={draft.title ?? ''}
          onChange={(event) =>
            onChangeDraft({
              ...draft,
              title: event.target.value,
            })
          }
          placeholder="제목"
          // TODO: Input 스타일 확인
          // 기존 스타일 코드
          // className="h-[29px] gap-0 border-b-0 px-[10px] py-0 shadow-[inset_0_-1px_0_var(--color-gray-400)]"
          // inputClassName="my-0 h-[17px] text-[14px] leading-[17px] font-medium tracking-normal text-gray-950 placeholder:text-gray-500"
          className="h-[29px] border-b-0 px-[10px] tracking-normal"
          inputClassName="text-[14px] font-medium"
        />

        <div className="flex w-full flex-col gap-2">
          {isAllDay ? (
            <div className="flex h-[26px] w-full items-center gap-2">
              <ScheduleFieldIcon>
                <DateIcon width={15} height={16} aria-hidden />
              </ScheduleFieldIcon>

              <div className="flex min-w-0 flex-1 items-center gap-1">
                <div className="min-w-0 flex-1">
                  <DisplayDateField value={draft.start} onChange={updateAllDayStart} />
                </div>

                <RangeSeparatorIcon width={10.5} height={1} className="shrink-0" aria-hidden />

                <div className="min-w-0 flex-1">
                  <DisplayDateField value={allDayDisplayEndValue} onChange={updateAllDayEnd} />
                </div>
              </div>
            </div>
          ) : showDateOnlyTimedField ? (
            <div className="flex h-[26px] w-full items-center gap-2">
              <ScheduleFieldIcon>
                <DateIcon width={15} height={16} aria-hidden />
              </ScheduleFieldIcon>

              <div className="w-[106.75px] shrink-0">
                <DisplayDateField value={draft.start} onChange={updateTimedDateOnlyDraft} />
              </div>
            </div>
          ) : (
            <>
              <div className="flex h-[26px] w-full items-center gap-2">
                <ScheduleFieldIcon>
                  <WatchIcon width={16} height={16} aria-hidden />
                </ScheduleFieldIcon>

                <div className="flex min-w-0 flex-1 items-center gap-1">
                  <div className="min-w-0 flex-1">
                    <DisplayTimeField
                      value={draft.start}
                      onChange={(nextValue) => updateTimedStart(timedStartDateValue, nextValue)}
                    />
                  </div>

                  <RangeSeparatorIcon width={10.5} height={1} className="shrink-0" aria-hidden />

                  <div className="min-w-0 flex-1">
                    <DisplayTimeField
                      value={draft.end}
                      onChange={(nextValue) => updateTimedEnd(nextValue)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex h-[26px] w-full items-center gap-2">
                <ScheduleFieldIcon>
                  <DateIcon width={15} height={16} aria-hidden />
                </ScheduleFieldIcon>

                <div className="w-[106.75px] shrink-0">
                  <DisplayDateField value={draft.start} onChange={updateTimedDateOnlyDraft} />
                </div>
              </div>
            </>
          )}

          <label className="flex h-[26px] w-fit cursor-pointer items-center gap-2 text-[12px] leading-[14px] font-normal tracking-normal text-gray-700">
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={handleToggleAllDay}
              className="sr-only"
            />
            <ScheduleFieldIcon>
              <CheckboxIcon
                width={16}
                height={16}
                data-calendar-all-day-checkbox-icon="true"
                aria-hidden="true"
                className={cn('calendar-all-day-checkbox-icon', {
                  'calendar-all-day-checkbox-icon--checked': isAllDay,
                })}
              />
            </ScheduleFieldIcon>
            <span>종일</span>
          </label>
        </div>

        <textarea
          value={draft.memo ?? ''}
          onChange={(event) =>
            onChangeDraft({
              ...draft,
              memo: event.target.value,
            })
          }
          placeholder="메모"
          className="ring-tag-gray-200 focus:ring-tag-gray-200 h-[100px] w-full shrink-0 resize-none overflow-y-auto rounded-[5px] px-3 py-[10px] text-[12px] leading-[16px] font-medium tracking-[-0.02em] text-gray-950 ring-1 outline-none ring-inset placeholder:text-gray-500"
        />

        <div className="flex flex-col items-start gap-2">
          <div className="h-[14px] text-[12px] leading-[14px] font-medium tracking-normal text-gray-600">
            일정 색상
          </div>

          <CollapsibleColorPicker
            value={draft.colorId}
            options={QUICK_EVENT_COLOR_OPTIONS}
            onChange={handleSelectColor}
            swatchSlotSize={24}
            swatchGap={4}
          />
        </div>

        <div className="flex w-full flex-col gap-1">
          <div className="flex h-[29px] w-full items-center gap-2 rounded-[5px] px-2 ring-1 ring-gray-300 ring-inset">
            <CompactFieldIcon>
              <LocationIcon width={8.4} height={12} aria-hidden />
            </CompactFieldIcon>

            <input
              value={draft.location ?? ''}
              onChange={(event) =>
                onChangeDraft({
                  ...draft,
                  location: event.target.value,
                })
              }
              placeholder="장소"
              className={cn(
                'h-[17px] min-w-0 flex-1 border-0 bg-transparent px-0 text-gray-700 outline-none placeholder:font-normal placeholder:text-gray-500',
                COMPACT_INPUT_TEXT_CLASS_NAME,
              )}
            />
          </div>

          <div className="flex h-[29px] w-full items-center gap-2 rounded-[5px] px-2 ring-1 ring-gray-300 ring-inset">
            <CompactFieldIcon>
              <LinkIcon width={12} height={6} aria-hidden />
            </CompactFieldIcon>

            <input
              value={draft.url ?? ''}
              onChange={(event) =>
                onChangeDraft({
                  ...draft,
                  url: event.target.value,
                })
              }
              placeholder="채용정보 URL"
              className={cn(
                'h-[17px] min-w-0 flex-1 border-0 bg-transparent px-0 text-gray-700 outline-none placeholder:font-normal placeholder:text-gray-500',
                COMPACT_INPUT_TEXT_CLASS_NAME,
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* TODO: 리마인더 해제 시 reminderMinutes 전달값(null/0 등) 확인 필요 */}
            <Select
              value={draft.reminderMinutes?.toString() ?? ''}
              options={REMINDER_OPTIONS}
              placeholder="리마인더"
              leadingIcon={
                <CompactFieldIcon>
                  <Watch2Icon className="h-3 w-3" aria-hidden />
                </CompactFieldIcon>
              }
              onChange={(value) => {
                const reminderMinutes = Number(value);

                if (!isReminderMinutes(reminderMinutes)) return;

                onChangeDraft({
                  ...draft,
                  reminderMinutes,
                });
              }}
              triggerClassName={COMPACT_SELECT_TRIGGER_CLASS_NAME}
              contentClassName="shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
              arrowIconClassName="text-gray-400"
            />

            <Select
              value={draft.category ?? ''}
              options={CATEGORY_OPTIONS}
              placeholder="일정구분"
              onChange={(value) =>
                onChangeDraft({
                  ...draft,
                  category: value as CalendarEventCategory,
                })
              }
              triggerClassName={COMPACT_SELECT_TRIGGER_CLASS_NAME}
              contentClassName="shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
              arrowIconClassName="text-gray-400"
            />
          </div>
        </div>
      </div>
    </>
  );
}

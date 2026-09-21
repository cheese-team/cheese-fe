import { DEFAULT_EVENT_COLOR } from '@/app/(app)/calendar/_model/constants';
import { parseCalendarDate } from '@/app/(app)/calendar/_lib/date';
import { apiClient } from '@/api/client';

import type { CalendarEvent, CalendarEventDraft } from '@/app/(app)/calendar/_model/types';

type CalendarEventRequest = Pick<CalendarEventDraft, 'title' | 'start' | 'end'> &
  Partial<
    Pick<
      CalendarEventDraft,
      'allDay' | 'memo' | 'location' | 'url' | 'colorId' | 'category' | 'reminderMinutes'
    >
  >;

type GetCalendarEventsParams = {
  from?: string;
  to?: string;
  signal?: AbortSignal;
};

type CalendarEventMutationParams = {
  draft: CalendarEventDraft;
};

type UpdateCalendarEventParams = CalendarEventMutationParams & {
  eventId: string;
};

type DeleteCalendarEventParams = {
  eventId: string;
};

function toCalendarEventRequest(draft: CalendarEventDraft): CalendarEventRequest {
  const allDay = draft.allDay ?? false;

  const toApiDateValue = (value: string) => {
    if (allDay) {
      return value;
    }

    return parseCalendarDate(value)?.toISOString() ?? value;
  };

  return {
    title: draft.title,
    start: toApiDateValue(draft.start),
    end: toApiDateValue(draft.end),
    allDay,
    memo: draft.memo,
    location: draft.location,
    url: draft.url,
    colorId: draft.colorId ?? DEFAULT_EVENT_COLOR,
    category: draft.category,
    reminderMinutes: draft.reminderMinutes,
  };
}

export function getCalendarEvents({ from, to, signal }: GetCalendarEventsParams) {
  return apiClient<CalendarEvent[]>('/backend-api/calendar/events', {
    method: 'GET',
    query: { from, to },
    signal,
    cache: 'no-store',
  });
}

export function createCalendarEvent({ draft }: CalendarEventMutationParams) {
  return apiClient<CalendarEvent>('/backend-api/calendar/events', {
    method: 'POST',
    body: JSON.stringify(toCalendarEventRequest(draft)),
  });
}

export function updateCalendarEvent({ eventId, draft }: UpdateCalendarEventParams) {
  return apiClient<CalendarEvent>(`/backend-api/calendar/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(toCalendarEventRequest(draft)),
  });
}

export function deleteCalendarEvent({ eventId }: DeleteCalendarEventParams) {
  return apiClient<CalendarEvent>(`/backend-api/calendar/events/${eventId}`, {
    method: 'DELETE',
  });
}

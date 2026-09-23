'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { ApiError } from '@/api/client';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import {
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useUpdateCalendarEventMutation,
} from '@/queries/calendar/useCalendarMutations';
import { useCalendarEvents } from '@/queries/calendar/useCalendarEvents';

import {
  applyDraftToEvent,
  createCalendarEventFromDraft,
  hasTimedSlotConflict,
} from '../_lib/event-mapper';
import type { CalendarEvent, CalendarEventDraft } from '../_model/types';

type CalendarMutationStatus =
  | 'success'
  | 'invalid'
  | 'conflict'
  | 'not-found'
  | 'loading'
  | 'error';
type CalendarDeleteStatus = 'success' | 'not-found' | 'loading' | 'error';

type CalendarStoreContextValue = {
  events: CalendarEvent[];
  isLoading: boolean;
  errorMessage: string | null;
  createEvent: (draft: CalendarEventDraft) => Promise<CalendarMutationStatus>;
  updateEvent: (draft: CalendarEventDraft) => Promise<CalendarMutationStatus>;
  deleteEvent: (eventId: string) => Promise<CalendarDeleteStatus>;
};

const CalendarStoreContext = createContext<CalendarStoreContextValue | null>(null);
const EMPTY_CALENDAR_EVENTS: CalendarEvent[] = [];

function getCalendarErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function getMutationErrorMessage(error: unknown, fallback: string) {
  if (!error) {
    return null;
  }

  return getCalendarErrorMessage(error, fallback);
}

export function CalendarStoreProvider({ children }: { children: ReactNode }) {
  const {
    data: currentUser,
    error: currentUserError,
    isPending: isCurrentUserPending,
    isRefetchError: isCurrentUserRefetchError,
  } = useCurrentUser();
  const hasCurrentUserError = Boolean(currentUserError) || isCurrentUserRefetchError;
  const hasAuthenticatedUser = Boolean(currentUser);
  const canLoadCalendarEvents = hasAuthenticatedUser && !hasCurrentUserError;
  const {
    data: calendarEvents,
    error: calendarEventsError,
    isPending: isCalendarEventsPending,
  } = useCalendarEvents({ enabled: canLoadCalendarEvents });
  const {
    mutateAsync: createCalendarEventAsync,
    reset: resetCreateCalendarEvent,
    error: createCalendarEventError,
  } = useCreateCalendarEventMutation();
  const {
    mutateAsync: updateCalendarEventAsync,
    reset: resetUpdateCalendarEvent,
    error: updateCalendarEventError,
  } = useUpdateCalendarEventMutation();
  const {
    mutateAsync: deleteCalendarEventAsync,
    reset: resetDeleteCalendarEvent,
    error: deleteCalendarEventError,
  } = useDeleteCalendarEventMutation();

  const events = canLoadCalendarEvents
    ? (calendarEvents ?? EMPTY_CALENDAR_EVENTS)
    : EMPTY_CALENDAR_EVENTS;
  const isCalendarLoading =
    isCurrentUserPending || (canLoadCalendarEvents && isCalendarEventsPending && !calendarEvents);

  const resetMutationErrors = useCallback(() => {
    resetCreateCalendarEvent();
    resetUpdateCalendarEvent();
    resetDeleteCalendarEvent();
  }, [resetCreateCalendarEvent, resetDeleteCalendarEvent, resetUpdateCalendarEvent]);

  const createEvent = useCallback(
    async (draft: CalendarEventDraft): Promise<CalendarMutationStatus> => {
      if (isCalendarLoading) {
        return 'loading';
      }

      if (!canLoadCalendarEvents) {
        return 'error';
      }

      resetMutationErrors();

      const normalizedEvent = createCalendarEventFromDraft(draft, 'pending');

      if (!normalizedEvent) {
        return 'invalid';
      }

      if (hasTimedSlotConflict(events, normalizedEvent)) {
        return 'conflict';
      }

      try {
        await createCalendarEventAsync({
          draft: normalizedEvent,
        });
        return 'success';
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          resetCreateCalendarEvent();
          return 'conflict';
        }

        return 'error';
      }
    },
    [
      createCalendarEventAsync,
      canLoadCalendarEvents,
      events,
      isCalendarLoading,
      resetCreateCalendarEvent,
      resetMutationErrors,
    ],
  );

  const updateEvent = useCallback(
    async (draft: CalendarEventDraft): Promise<CalendarMutationStatus> => {
      if (isCalendarLoading) {
        return 'loading';
      }

      if (!canLoadCalendarEvents) {
        return 'error';
      }

      resetMutationErrors();

      const editingEventId = draft.id;

      if (!editingEventId) {
        return 'invalid';
      }

      const currentEvent = events.find((event) => event.id === editingEventId);

      if (!currentEvent) {
        return 'not-found';
      }

      const nextEvent = applyDraftToEvent(currentEvent, draft);

      if (!nextEvent) {
        return 'invalid';
      }

      if (hasTimedSlotConflict(events, nextEvent, nextEvent.id)) {
        return 'conflict';
      }

      try {
        await updateCalendarEventAsync({
          eventId: editingEventId,
          draft: nextEvent,
        });
        return 'success';
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          resetUpdateCalendarEvent();
          return 'not-found';
        }

        if (error instanceof ApiError && error.status === 409) {
          resetUpdateCalendarEvent();
          return 'conflict';
        }

        return 'error';
      }
    },
    [
      canLoadCalendarEvents,
      events,
      isCalendarLoading,
      resetMutationErrors,
      resetUpdateCalendarEvent,
      updateCalendarEventAsync,
    ],
  );

  const deleteEvent = useCallback(
    async (eventId: string): Promise<CalendarDeleteStatus> => {
      if (isCalendarLoading) {
        return 'loading';
      }

      if (!canLoadCalendarEvents) {
        return 'error';
      }

      resetMutationErrors();

      try {
        await deleteCalendarEventAsync({ eventId });
        return 'success';
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          resetDeleteCalendarEvent();
          return 'not-found';
        }

        return 'error';
      }
    },
    [
      canLoadCalendarEvents,
      deleteCalendarEventAsync,
      isCalendarLoading,
      resetDeleteCalendarEvent,
      resetMutationErrors,
    ],
  );

  const authErrorMessage =
    !isCurrentUserPending && !canLoadCalendarEvents
      ? getCalendarErrorMessage(currentUserError, '로그인 정보를 확인할 수 없습니다.')
      : null;
  const queryErrorMessage = calendarEventsError
    ? getCalendarErrorMessage(calendarEventsError, '일정을 불러오지 못했습니다.')
    : null;
  const errorMessage =
    authErrorMessage ??
    queryErrorMessage ??
    getMutationErrorMessage(createCalendarEventError, '일정을 등록하지 못했습니다.') ??
    getMutationErrorMessage(updateCalendarEventError, '일정을 수정하지 못했습니다.') ??
    getMutationErrorMessage(deleteCalendarEventError, '일정을 삭제하지 못했습니다.');

  const value = useMemo(
    () => ({
      events,
      isLoading: isCalendarLoading,
      errorMessage,
      createEvent,
      updateEvent,
      deleteEvent,
    }),
    [events, isCalendarLoading, errorMessage, createEvent, updateEvent, deleteEvent],
  );

  return <CalendarStoreContext.Provider value={value}>{children}</CalendarStoreContext.Provider>;
}

export function useCalendarStore() {
  const context = useContext(CalendarStoreContext);

  if (!context) {
    throw new Error('useCalendarStore must be used within CalendarStoreProvider');
  }

  return context;
}

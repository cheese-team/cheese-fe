import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from '@/api/calendar.api';

import { calendarQueryKeys } from './calendarQueryKeys';

import type { CalendarEventDraft } from '@/app/(app)/calendar/_model/types';

type CreateCalendarEventVariables = {
  draft: CalendarEventDraft;
};

type UpdateCalendarEventVariables = CreateCalendarEventVariables & {
  eventId: string;
};

type DeleteCalendarEventVariables = {
  eventId: string;
};

function useInvalidateCalendarEvents() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      queryKey: calendarQueryKeys.events(),
    });
}

export function useCreateCalendarEventMutation() {
  const invalidateCalendarEvents = useInvalidateCalendarEvents();

  return useMutation({
    mutationFn: ({ draft }: CreateCalendarEventVariables) => createCalendarEvent({ draft }),
    onSettled: async () => {
      await invalidateCalendarEvents();
    },
  });
}

export function useUpdateCalendarEventMutation() {
  const invalidateCalendarEvents = useInvalidateCalendarEvents();

  return useMutation({
    mutationFn: ({ eventId, draft }: UpdateCalendarEventVariables) =>
      updateCalendarEvent({ eventId, draft }),
    onSettled: async () => {
      await invalidateCalendarEvents();
    },
  });
}

export function useDeleteCalendarEventMutation() {
  const invalidateCalendarEvents = useInvalidateCalendarEvents();

  return useMutation({
    mutationFn: ({ eventId }: DeleteCalendarEventVariables) => deleteCalendarEvent({ eventId }),
    onSettled: async () => {
      await invalidateCalendarEvents();
    },
  });
}

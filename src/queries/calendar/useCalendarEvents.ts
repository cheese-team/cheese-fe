import { useQuery } from '@tanstack/react-query';

import { getCalendarEvents } from '@/api/calendar.api';

import { calendarQueryKeys } from './calendarQueryKeys';

type UseCalendarEventsParams = {
  enabled: boolean;
};

export function useCalendarEvents({ enabled }: UseCalendarEventsParams) {
  return useQuery({
    queryKey: calendarQueryKeys.events(),
    queryFn: ({ signal }) => getCalendarEvents({ signal }),
    enabled,
  });
}

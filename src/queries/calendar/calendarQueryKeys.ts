export const calendarQueryKeys = {
  all: ['calendar'] as const,

  events: () => [...calendarQueryKeys.all, 'events'] as const,
};

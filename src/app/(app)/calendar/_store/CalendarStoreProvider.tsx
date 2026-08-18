'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  applyDraftToEvent,
  createCalendarEventFromDraft,
  hasTimedSlotConflict,
} from '../_lib/event-mapper';
import { mockEvents } from '../_model/mock-events';
import type {
  CalendarEvent,
  CalendarEventCategory,
  CalendarEventDraft,
  EventColorId,
  ReminderMinutes,
} from '../_model/types';

const CALENDAR_STORAGE_KEY = 'cheese:calendar-events:v1';
const EVENT_COLOR_IDS = [
  'tag-red',
  'tag-yellow',
  'tag-green',
  'tag-blue',
  'tag-purple',
  'tag-gray',
] as const satisfies readonly EventColorId[];
const EVENT_CATEGORIES = [
  'interview',
  'document',
  'personal',
  'assignment',
  'meeting',
  'etc',
] as const satisfies readonly CalendarEventCategory[];
const REMINDER_MINUTES = [
  0, 5, 10, 15, 30, 60, 120, 1440,
] as const satisfies readonly ReminderMinutes[];

type CalendarStoreContextValue = {
  events: CalendarEvent[];
  createEvent: (draft: CalendarEventDraft) => 'success' | 'invalid' | 'conflict';
  updateEvent: (draft: CalendarEventDraft) => 'success' | 'invalid' | 'conflict' | 'not-found';
  deleteEvent: (eventId: string) => void;
};

const CalendarStoreContext = createContext<CalendarStoreContextValue | null>(null);

function createEventId() {
  if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `evt-${Date.now()}`;
}

function getInitialEvents() {
  return mockEvents;
}

function isIncluded<T extends string | number>(value: unknown, values: readonly T[]): value is T {
  return values.some((candidate) => candidate === value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

function isCalendarEvent(value: unknown): value is CalendarEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const event = value as Record<string, unknown>;

  return (
    typeof event.id === 'string' &&
    typeof event.title === 'string' &&
    typeof event.start === 'string' &&
    typeof event.end === 'string' &&
    isOptionalString(event.memo) &&
    (event.allDay === undefined || typeof event.allDay === 'boolean') &&
    isOptionalString(event.spaceId) &&
    (event.colorId === undefined || isIncluded(event.colorId, EVENT_COLOR_IDS)) &&
    (event.category === undefined || isIncluded(event.category, EVENT_CATEGORIES)) &&
    (event.reminderMinutes === undefined || isIncluded(event.reminderMinutes, REMINDER_MINUTES)) &&
    isOptionalString(event.location) &&
    isOptionalString(event.url) &&
    isOptionalString(event.createdAt) &&
    isOptionalString(event.updatedAt)
  );
}

function normalizeStoredEvent(event: CalendarEvent): CalendarEvent {
  if (event.category === 'assignment') {
    return { ...event, category: 'document' };
  }

  if (event.category === 'meeting') {
    return { ...event, category: 'personal' };
  }

  return event;
}

function readStoredEvents() {
  try {
    const storedEvents = window.localStorage.getItem(CALENDAR_STORAGE_KEY);

    if (!storedEvents) {
      return null;
    }

    const parsedEvents: unknown = JSON.parse(storedEvents);

    if (!Array.isArray(parsedEvents)) {
      return null;
    }

    const validEvents = parsedEvents.filter(isCalendarEvent).map(normalizeStoredEvent);

    return validEvents.length > 0 ? validEvents : null;
  } catch {
    return null;
  }
}

function writeStoredEvents(events: CalendarEvent[]) {
  try {
    window.localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
  } catch {
    // localStorage 저장 실패는 UI 동작을 막지 않음
  }
}

export function CalendarStoreProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>(getInitialEvents);
  const storageReadyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const timerId = window.setTimeout(() => {
      if (cancelled) return;

      const storedEvents = readStoredEvents();

      if (storedEvents) {
        setEvents(storedEvents);
      }

      storageReadyRef.current = true;
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, []);

  useEffect(() => {
    if (!storageReadyRef.current) return;

    writeStoredEvents(events);
  }, [events]);

  const createEvent = useCallback(
    (draft: CalendarEventDraft) => {
      const newEvent = createCalendarEventFromDraft(draft, createEventId());

      if (!newEvent) {
        return 'invalid';
      }

      if (hasTimedSlotConflict(events, newEvent)) {
        return 'conflict';
      }

      setEvents((prevEvents) => [...prevEvents, newEvent]);
      return 'success';
    },
    [events],
  );

  const updateEvent = useCallback(
    (draft: CalendarEventDraft) => {
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

      setEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === nextEvent.id ? nextEvent : event)),
      );
      return 'success';
    },
    [events],
  );

  const deleteEvent = useCallback((eventId: string) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
  }, []);

  const value = useMemo(
    () => ({
      events,
      createEvent,
      updateEvent,
      deleteEvent,
    }),
    [events, createEvent, updateEvent, deleteEvent],
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

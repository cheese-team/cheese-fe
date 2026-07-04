'use client';

import { useCallback, useState } from 'react';

import { DEFAULT_EVENT_COLOR } from '@/app/(app)/calendar/_model/constants';
import type { CalendarEventDraft } from '@/app/(app)/calendar/_model/types';

export type CalendarPopoverPlacement = 'auto' | 'cell-center';

export type CalendarPopoverState = {
  x: number;
  y: number;
  draft: CalendarEventDraft;
};

type CalendarPopoverBoundsRef = {
  current: HTMLElement | null;
};

type OpenCreatePopoverPayload = {
  draft: CalendarEventDraft;
  rect: DOMRect;
  placement?: CalendarPopoverPlacement;
};

type OpenEditPopoverPayload = {
  event: Partial<CalendarEventDraft>;
  rect: DOMRect;
  placement?: CalendarPopoverPlacement;
};

const CREATE_POPOVER_WIDTH = 320;
const CREATE_POPOVER_HEIGHT = 455;
const CREATE_POPOVER_GAP = 8;
const VIEWPORT_PADDING = 12;
const CELL_CENTER_BOTTOM_OFFSET = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * 팝오버 내부 폼이 항상 같은 형태의 값을 갖도록 기본값을 채워 넣는다.
 */
function toEditableDraft(draft: Partial<CalendarEventDraft>): CalendarEventDraft {
  return {
    id: draft.id,
    title: draft.title ?? '',
    start: draft.start ?? '',
    end: draft.end ?? draft.start ?? '',
    allDay: draft.allDay ?? true,
    colorId: draft.colorId ?? DEFAULT_EVENT_COLOR,
    memo: draft.memo ?? '',
    location: draft.location ?? '',
    reminderMinutes: draft.reminderMinutes,
    spaceId: draft.spaceId,
  };
}

/**
 * 셀 위치와 화면 경계를 기준으로 팝오버 좌표를 계산한다.
 */
export function getPopoverPosition(
  rect: DOMRect,
  options?: {
    placement?: CalendarPopoverPlacement;
    boundsRect?: DOMRect | null;
  },
) {
  const boundsRect = options?.boundsRect ?? null;
  const minX = Math.max((boundsRect?.left ?? 0) + VIEWPORT_PADDING, VIEWPORT_PADDING);
  const maxX =
    Math.min(boundsRect?.right ?? window.innerWidth, window.innerWidth) -
    CREATE_POPOVER_WIDTH -
    VIEWPORT_PADDING;
  const minY = Math.max((boundsRect?.top ?? 0) + VIEWPORT_PADDING, VIEWPORT_PADDING);
  const maxY =
    Math.min(boundsRect?.bottom ?? window.innerHeight, window.innerHeight) -
    CREATE_POPOVER_HEIGHT -
    VIEWPORT_PADDING;

  if (options?.placement === 'cell-center') {
    const centeredX = rect.left + rect.width / 2 - CREATE_POPOVER_WIDTH / 2;
    const hasSpaceAbove = rect.top - CREATE_POPOVER_HEIGHT - CREATE_POPOVER_GAP >= minY;
    const hasSpaceBelow =
      rect.bottom + CREATE_POPOVER_HEIGHT + CREATE_POPOVER_GAP <= maxY + CELL_CENTER_BOTTOM_OFFSET;
    const anchoredY =
      hasSpaceAbove || !hasSpaceBelow
        ? rect.top - CREATE_POPOVER_HEIGHT - CREATE_POPOVER_GAP
        : rect.bottom + CREATE_POPOVER_GAP;

    return {
      x: clamp(centeredX, minX, Math.max(minX, maxX)),
      y: clamp(anchoredY, minY, Math.max(minY, maxY)),
    };
  }

  let x = rect.right + CREATE_POPOVER_GAP;
  let y = rect.top;

  if (x + CREATE_POPOVER_WIDTH > (boundsRect?.right ?? window.innerWidth) - VIEWPORT_PADDING) {
    x = rect.left - CREATE_POPOVER_WIDTH - CREATE_POPOVER_GAP;
  }

  x = clamp(x, minX, Math.max(minX, maxX));

  const anchorHeight = rect.height;

  if (y + CREATE_POPOVER_HEIGHT > (boundsRect?.bottom ?? window.innerHeight) - VIEWPORT_PADDING) {
    y = rect.top - (CREATE_POPOVER_HEIGHT - anchorHeight);
  }

  y = clamp(y, minY, Math.max(minY, maxY));

  return { x, y };
}

/**
 * 일정 생성/수정 팝오버 상태를 한 훅에서 관리한다.
 * CalendarScreen은 열기/닫기/초안 갱신만 연결하면 된다.
 */
export function useCalendarModal(boundsRef: CalendarPopoverBoundsRef) {
  const [createPopover, setCreatePopover] = useState<CalendarPopoverState | null>(null);
  const [editPopover, setEditPopover] = useState<CalendarPopoverState | null>(null);

  const getViewportBounds = useCallback(() => {
    return boundsRef.current?.getBoundingClientRect() ?? null;
  }, [boundsRef]);

  const closeCreatePopover = useCallback(() => {
    setCreatePopover(null);
  }, []);

  const closeEditPopover = useCallback(() => {
    setEditPopover(null);
  }, []);

  const openCreatePopover = useCallback(
    ({ rect, draft, placement = 'auto' }: OpenCreatePopoverPayload) => {
      const { x, y } = getPopoverPosition(rect, {
        placement,
        boundsRect: getViewportBounds(),
      });

      setEditPopover(null);
      setCreatePopover({
        x,
        y,
        draft: toEditableDraft(draft),
      });
    },
    [getViewportBounds],
  );

  const openEditPopover = useCallback(
    ({ rect, event, placement = 'auto' }: OpenEditPopoverPayload) => {
      const { x, y } = getPopoverPosition(rect, {
        placement,
        boundsRect: getViewportBounds(),
      });

      setCreatePopover(null);
      setEditPopover({
        x,
        y,
        draft: toEditableDraft(event),
      });
    },
    [getViewportBounds],
  );

  const updateCreateDraft = useCallback((nextDraft: CalendarEventDraft) => {
    setCreatePopover((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        draft: nextDraft,
      };
    });
  }, []);

  const updateEditDraft = useCallback((nextDraft: CalendarEventDraft) => {
    setEditPopover((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        draft: nextDraft,
      };
    });
  }, []);

  return {
    createPopover,
    editPopover,
    openCreatePopover,
    openEditPopover,
    closeCreatePopover,
    closeEditPopover,
    updateCreateDraft,
    updateEditDraft,
  };
}

'use client';

import { useRef, useState } from 'react';

import { useCalendarModal } from '../_hooks/useCalendarModal';
import { useCalendarView } from '../_hooks/useCalendarView';
import {
  applyDraftToEvent,
  createCalendarEventFromDraft,
  hasTimedSlotConflict,
} from '../_lib/event-mapper';
import { mockEvents } from '../_model/mock-events';
import type { CalendarEvent } from '../_model/types';
import { CalendarEventPopover } from './popover/CalendarEventPopover';
import { CalendarToolbar } from './toolbar/CalendarToolbar';
import { CalendarCore } from './views/CalendarCore';

/**
 * CalendarScreen
 * - 캘린더 화면의 최상위 컨테이너
 * - 툴바 상태, 팝오버 상태, 이벤트 CRUD를 조합해서 실제 화면에 연결한다.
 */
export default function CalendarScreen() {
  const screenRef = useRef<HTMLDivElement | null>(null);

  // 상단 툴바 상태
  const { view, setView, title, setTitle, moveToToday, moveToPrev, moveToNext } = useCalendarView({
    initialView: 'month',
    initialTitle: '2026년 2월',
  });

  // 실제 일정 데이터
  const [events, setEvents] = useState<CalendarEvent[]>(() => mockEvents);

  // 생성/수정 팝오버 상태
  const {
    createPopover,
    editPopover,
    openCreatePopover,
    openEditPopover,
    closeCreatePopover,
    closeEditPopover,
    updateCreateDraft,
    updateEditDraft,
  } = useCalendarModal(screenRef);

  /**
   * 새 일정을 저장한다.
   * 제목이 비어 있으면 기존 동작과 동일하게 팝오버만 닫는다.
   */
  const handleCreateEvent = () => {
    if (!createPopover) return;
    if (!createPopover.draft.title?.trim()) {
      closeCreatePopover();
      return;
    }

    const newEvent = createCalendarEventFromDraft(createPopover.draft, crypto.randomUUID());
    if (!newEvent) {
      closeCreatePopover();
      return;
    }

    if (hasTimedSlotConflict(events, newEvent)) {
      window.alert('해당 시간 칸에는 이미 일정이 있습니다.');
      return;
    }

    setEvents((prev) => [...prev, newEvent]);
    closeCreatePopover();
  };

  /**
   * 기존 일정을 수정한다.
   */
  const handleUpdateEvent = () => {
    const editingEventId = editPopover?.draft.id;
    if (!editingEventId) {
      closeEditPopover();
      return;
    }

    const currentEvent = events.find((event) => event.id === editingEventId);
    if (!currentEvent) {
      closeEditPopover();
      return;
    }

    const nextEvent = applyDraftToEvent(currentEvent, editPopover.draft);
    if (!nextEvent) {
      closeEditPopover();
      return;
    }

    if (hasTimedSlotConflict(events, nextEvent, nextEvent.id)) {
      window.alert('해당 시간 칸에는 이미 일정이 있습니다.');
      return;
    }

    setEvents((prev) => prev.map((event) => (event.id === nextEvent.id ? nextEvent : event)));
    closeEditPopover();
  };

  /**
   * 일정 삭제 후, 해당 일정이 수정 팝오버에서 열려 있으면 같이 닫아 준다.
   */
  const handleDeleteEventById = (eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));

    if (editPopover?.draft.id === eventId) {
      closeEditPopover();
    }
  };

  return (
    <div className="flex h-full min-h-0">
      <div ref={screenRef} className="flex h-full min-h-0 w-full flex-col">
        <div className="shrink-0 pt-[62px]">
          <CalendarToolbar
            view={view}
            title={title}
            onChangeView={setView}
            onClickToday={moveToToday}
            onClickPrev={moveToPrev}
            onClickNext={moveToNext}
          />
        </div>

        <section className="min-h-0 flex-1 overflow-hidden">
          <CalendarCore
            view={view}
            events={events}
            selectedEventId={editPopover?.draft.id}
            onTitleChange={setTitle}
            onClickDateCell={({ draft, rect, placement }) => {
              openCreatePopover({ draft, rect, placement });
            }}
            onClickEvent={({ event, rect }) => {
              openEditPopover({
                event,
                rect,
                placement: view === 'day' ? 'cell-center' : 'auto',
              });
            }}
            onDeleteEvent={handleDeleteEventById}
          />
        </section>

        {createPopover && (
          <CalendarEventPopover
            open={true}
            x={createPopover.x}
            y={createPopover.y}
            draft={createPopover.draft}
            onClose={closeCreatePopover}
            onCommit={handleCreateEvent}
            onChangeDraft={updateCreateDraft}
          />
        )}

        {editPopover && (
          <CalendarEventPopover
            open={true}
            x={editPopover.x}
            y={editPopover.y}
            draft={editPopover.draft}
            onClose={closeEditPopover}
            onCommit={handleUpdateEvent}
            onChangeDraft={updateEditDraft}
          />
        )}
      </div>
    </div>
  );
}

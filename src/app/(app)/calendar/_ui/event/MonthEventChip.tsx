'use client';

import type { CSSProperties, MouseEvent } from 'react';

import { DeleteIcon } from '../../../../../assets/icons/calendar';
import { getEventColorTokens } from '../../_model/constants';
import type { CalendarEvent } from '../../_model/types';

type Props = {
  event: CalendarEvent;
  onDelete?: () => void;
};

export function MonthEventChip({ event, onDelete }: Props) {
  const color = getEventColorTokens(event.colorId);

  const handleDelete = (clickEvent: MouseEvent<HTMLButtonElement>) => {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      className="calendar-event-chip calendar-event-chip--month"
      style={
        {
          '--calendar-event-bg-default': color.defaultBg,
          '--calendar-event-bg-hover': color.hoverBg,
          '--calendar-event-bg-selected': color.selectedBg,
          '--calendar-event-text-default': color.defaultText,
          '--calendar-event-text-selected': color.selectedText,
          '--calendar-event-border-default': color.defaultBorder,
          '--calendar-event-border-hover': color.hoverBorder,
          '--calendar-event-border-selected': color.selectedBorder,
        } as CSSProperties
      }
    >
      <span className="calendar-event-chip__title">{event.title}</span>

      <button
        type="button"
        data-calendar-event-delete
        onMouseDown={handleDelete}
        onClick={handleDelete}
        className="calendar-event-chip__delete"
        aria-label="일정 삭제"
      >
        <DeleteIcon width={11} height={11} className="calendar-event-chip__delete-icon" />
      </button>
    </div>
  );
}

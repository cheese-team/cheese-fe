'use client';

import type { CSSProperties, MouseEvent } from 'react';

import { DeleteIcon } from '../../../../../assets/icons/calendar';
import { getEventColorTokens } from '../../_model/constants';
import type { EventColorId } from '../../_model/types';

type Props = {
  title: string;
  colorId?: EventColorId;
  onDelete?: () => void;
};

/**
 * 주간/일간 캘린더에서 사용하는 시간형 일정 칩.
 * 색상 토큰과 삭제 버튼 동작을 여기로 분리해 CalendarCore를 가볍게 유지한다.
 */
export function TimeGridEventChip({ title, colorId, onDelete }: Props) {
  const color = getEventColorTokens(colorId);

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      className="calendar-event-chip calendar-event-chip--timegrid"
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
      <span className="calendar-event-chip__title">{title}</span>

      <button
        type="button"
        data-calendar-event-delete
        onMouseDown={handleDelete}
        onClick={handleDelete}
        className="calendar-event-chip__delete"
        aria-label="일정 삭제"
      >
        <DeleteIcon
          width={14}
          height={14}
          className="calendar-event-chip__delete-icon"
          strokeWidth={1.6}
        />
      </button>
    </div>
  );
}

'use client';

import BaseModal from '@/components/common/Modal/BaseModal';
import type { CalendarEventDraft } from '../../_model/types';
import EventForm from './EventForm';

type EventFormModalProps = {
  open: boolean; // CalendarScreen에서 쓰는 이름 유지
  draft: CalendarEventDraft;
  onClose: () => void;
  onSubmit: (nextDraft: CalendarEventDraft) => void;
};

export function EventFormModal({ open, draft, onClose, onSubmit }: EventFormModalProps) {
  return (
    <BaseModal isOpen={open} onClose={onClose}>
      <div className="border-border bg-bg-white w-[520px] max-w-full rounded-2xl border">
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-base font-semibold">일정 생성</h2>
          <button
            type="button"
            className="hover:bg-bg-2 h-9 w-9 rounded-xl"
            onClick={onClose}
            aria-label="닫기"
            title="닫기"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">
          <EventForm initialValue={draft} onCancel={onClose} onSubmit={onSubmit} />
        </div>
      </div>
    </BaseModal>
  );
}

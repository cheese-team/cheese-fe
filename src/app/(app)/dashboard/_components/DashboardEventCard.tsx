import Link from 'next/link';

import { getEventColorTokens } from '@/app/(app)/calendar/_model/constants';
import type { CalendarEvent } from '@/app/(app)/calendar/_model/types';

import {
  formatDashboardDeadlineLabel,
  formatDashboardTimeRange,
  getDashboardEventLocation,
} from '../_lib/events';
import { getDashboardCategoryMeta } from '../_lib/event-category';

import { Chip } from '@/components/common/Chip';

import MemoIcon from '@/assets/icons/common/memo.svg';

type DashboardEventCardProps = {
  event: CalendarEvent;
};

export default function DashboardEventCard({ event }: DashboardEventCardProps) {
  const categoryMeta = getDashboardCategoryMeta(event);
  const deadlineLabel = formatDashboardDeadlineLabel(event);
  const timeRange = formatDashboardTimeRange(event);
  const location = getDashboardEventLocation(event);
  const colorTokens = getEventColorTokens(event.colorId);

  return (
    <Link
      href="/calendar"
      className="border-border hover:border-secondary-600 flex h-[226px] w-[312px] flex-col rounded-[10px] border bg-white p-5 transition-colors"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <Chip variant={categoryMeta.chipVariant} size="md">
          {categoryMeta.label}
        </Chip>

        <span className="w-[53px] text-[12px] leading-[30px] font-medium whitespace-nowrap text-gray-600">
          {deadlineLabel}
        </span>
      </div>

      <h3 className="mb-2 h-[30px] truncate leading-[30px] font-bold">{event.title}</h3>

      <div className="flex flex-col text-[14px] leading-[30px] text-gray-700">
        <p className="h-[30px]">{timeRange}</p>
        <p className="h-[30px] truncate">{location}</p>
      </div>

      {event.memo ? (
        <div
          className="mt-2 flex h-[38px] items-center gap-3 rounded-[5px] px-[14px]"
          style={{
            backgroundColor: colorTokens.defaultBg,
            border: `1px solid ${colorTokens.defaultBorder}`,
          }}
        >
          <span className="flex h-5 w-5 items-center justify-center">
            <MemoIcon className="h-[11.5px] w-[14px] shrink-0 text-gray-700" />
          </span>
          <p className="truncate text-[14px] leading-[30px] font-medium text-gray-700">
            {event.memo}
          </p>
        </div>
      ) : (
        <div className="mt-2 h-[38px]" aria-hidden="true" />
      )}
    </Link>
  );
}

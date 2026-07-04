import type { SVGProps } from 'react';

export function CalendarLineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false" {...props}>
      <rect
        x="3.75"
        y="5.25"
        width="12.5"
        height="11"
        rx="1.75"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M3.75 8.5H16.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7 3.75V6.25M13 3.75V6.25"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

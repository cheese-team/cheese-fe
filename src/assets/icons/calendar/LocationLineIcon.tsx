import type { SVGProps } from 'react';

export function LocationLineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M10 16.25C12.9167 13.1667 14.5 10.875 14.5 8.75C14.5 6.26472 12.4853 4.25 10 4.25C7.51472 4.25 5.5 6.26472 5.5 8.75C5.5 10.875 7.08333 13.1667 10 16.25Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="10" cy="8.75" r="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

import type { SVGProps } from 'react';

type ChevronDirection = 'left' | 'right' | 'up' | 'down';

type ChevronIconProps = SVGProps<SVGSVGElement> & {
  direction: ChevronDirection;
};

export function ChevronIcon({ direction, ...props }: ChevronIconProps) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d={
          direction === 'left'
            ? 'M8.75 3.5L5.25 7L8.75 10.5'
            : direction === 'right'
              ? 'M5.25 3.5L8.75 7L5.25 10.5'
              : direction === 'up'
                ? 'M3.5 8.75L7 5.25L10.5 8.75'
                : 'M3.5 5.25L7 8.75L10.5 5.25'
        }
        stroke="var(--color-gray-500)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

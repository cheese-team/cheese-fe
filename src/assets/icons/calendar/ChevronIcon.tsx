import type { SVGProps } from 'react';

type ChevronDirection = 'left' | 'right' | 'up' | 'down';

type ChevronIconProps = SVGProps<SVGSVGElement> & {
  direction: ChevronDirection;
};

export function ChevronIcon({ direction, ...props }: ChevronIconProps) {
  return (
    <svg
      viewBox="0 0 8 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d={
          direction === 'left'
            ? 'M5.5 3.5L2 7L5.5 10.5'
            : direction === 'right'
              ? 'M2.5 3.5L6 7L2.5 10.5'
              : direction === 'up'
                ? 'M0.5 8.75L4 5.25L7.5 8.75'
                : 'M0.5 5.25L4 8.75L7.5 5.25'
        }
        stroke="var(--color-gray-500)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

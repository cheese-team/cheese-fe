import type { SVGProps } from 'react';

type DeleteIconProps = SVGProps<SVGSVGElement> & {
  strokeWidth?: number;
};

export function DeleteIcon({ strokeWidth = 4, ...props }: DeleteIconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M6 6L14 14M14 6L6 14"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

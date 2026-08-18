import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonSize = 28 | 30 | 36 | 38 | 40 | 44 | 46 | 54;

export type ButtonVariant =
  | 'default'
  | 'light'
  | 'outline'
  | 'outlinePrimary'
  | 'outlineGray'
  | 'outlineLightGray'
  | 'gray'
  | 'circle';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  paddingX?: number;
  width?: number | string;
  fullWidth?: boolean;
  isLoading?: boolean;
  circleSize?: number;
  children?: ReactNode;
  /**
   * circle 버튼은 접근성을 위해 aria-label을 강력 권장합니다.
   */
  'aria-label'?: string;
}

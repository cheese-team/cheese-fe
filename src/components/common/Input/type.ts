import type { InputHTMLAttributes, ReactNode } from 'react';

export interface UnderlinedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  errorMessage?: ReactNode;
  successMessage?: ReactNode;
  rightAddon?: ReactNode;
  hideMessageSpace?: boolean;
  inputClassName?: string;
}

import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  errorMessage?: ReactNode;
  successMessage?: ReactNode;
  rightAddon?: ReactNode;
  showMessageSpace?: boolean;
  inputClassName?: string;
  ref?: React.Ref<HTMLInputElement>;
}

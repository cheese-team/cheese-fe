import { ComponentType, SVGProps } from 'react';

export type CategoryTabsSize = 'sm' | 'md';

export type CategoryTabItem<TValue extends string = string> = {
  label: string;
  value: TValue;
  disabled?: boolean;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

export type CategoryTabsProps<TValue extends string = string> = {
  items: readonly CategoryTabItem<TValue>[];
  activeValue: TValue;
  onChange: (value: TValue) => void;
  size?: CategoryTabsSize;
  className?: string;
};

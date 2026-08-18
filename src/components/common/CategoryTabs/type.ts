import { ComponentType, SVGProps } from 'react';

export type CategoryTabsSize = 'sm' | 'md';

export type CategoryTabItem<TValue extends string = string> = {
  label: string;
  value: TValue;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  disabled?: boolean;
};

export type CategoryTabsProps<TValue extends string = string> = {
  items: readonly CategoryTabItem<TValue>[];
  activeValue: TValue;
  onChange: (value: TValue) => void;
  size?: CategoryTabsSize;
  className?: string;
};

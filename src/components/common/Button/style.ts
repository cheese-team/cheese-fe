import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import type { ButtonProps, ButtonSize, ButtonVariant } from './type';

const base =
  'inline-flex items-center justify-center font-medium whitespace-nowrap hover:!opacity-80';

const disabledStateClass = 'cursor-not-allowed pointer-events-none';
const filledDisabled = 'bg-gray-400 text-gray-50';
const outlineDisabled = 'border-gray-400 text-gray-400 bg-white';

const variantClassMap: Record<Exclude<ButtonVariant, 'circle'>, string> = {
  default: 'bg-secondary-600 text-gray-50',
  light: 'bg-secondary-400 text-gray-50',

  outline: 'border-2 border-secondary-200 bg-white text-gray-700',
  outlineGray: 'border border-gray-500 bg-white text-gray-950',
  outlineLightGray: 'border border-gray-500 bg-white text-gray-600',

  gray: 'bg-gray-500 text-gray-50',
};

const variantDisabledClassMap: Record<Exclude<ButtonVariant, 'circle' | 'gray'>, string> = {
  default: filledDisabled,
  light: 'bg-secondary-100 text-gray-50',

  outline: `border-2 ${outlineDisabled}`,
  outlineGray: `border ${outlineDisabled}`,
  outlineLightGray: `border ${outlineDisabled}`,
};

const sizeClassMap: Record<ButtonSize, string> = {
  28: 'h-[28px] rounded-[5px] text-[12px]',
  30: 'h-[30px] rounded-[5px] text-[12px]',
  36: 'h-[36px] rounded-[10px] text-[12px]',
  38: 'h-[38px] rounded-[5px] text-[12px]',
  40: 'h-[40px] rounded-[10px] text-[14px]',
  44: 'h-[44px] rounded-[10px] text-[14px]',
  46: 'h-[46px] rounded-[10px] text-[16px]',
  54: 'h-[54px] rounded-[10px] text-[16px]',
};

export function getButtonStyle({
  variant = 'default',
  size = 40,
  paddingX,
  width,
  fullWidth,
  className,
  circleSize,
  disabled = false,
}: Pick<
  ButtonProps,
  'variant' | 'size' | 'paddingX' | 'width' | 'fullWidth' | 'className' | 'circleSize' | 'disabled'
>): {
  className: string;
  style: CSSProperties;
} {
  if (variant === 'circle') {
    return {
      className: cn(
        base,
        'rounded-full',
        'bg-gray-200',
        disabled && disabledStateClass, // circle 버튼은 disabled 시 색상 변경 없이 인터랙션만 비활성화
        className,
      ),
      style: { width: circleSize, height: circleSize },
    };
  }

  const finalVariantClass = disabled
    ? variant === 'gray'
      ? variantClassMap[variant]
      : variantDisabledClassMap[variant]
    : variantClassMap[variant];

  return {
    className: cn(
      base,
      sizeClassMap[size],
      finalVariantClass,
      disabled && disabledStateClass,
      className,
    ),
    style: {
      width: fullWidth ? '100%' : width,
      paddingInline: paddingX,
    },
  };
}

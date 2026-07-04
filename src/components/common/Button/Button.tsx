import { Slot } from '@radix-ui/react-slot';

import type { ButtonProps } from './type';
import { getButtonStyle } from './style';

export default function Button({
  asChild = false,
  variant = 'default',
  size = 40,
  paddingX,
  width,
  fullWidth = false,
  isLoading = false,
  disabled = false,
  circleSize = 48,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = Boolean(disabled || isLoading);

  const buttonStyle = getButtonStyle({
    variant,
    size,
    width,
    fullWidth,
    disabled: isDisabled,
    paddingX,
    className,
    circleSize,
  });

  const Component = asChild ? Slot : 'button';
  const componentProps = asChild
    ? {}
    : {
        type,
        disabled: isDisabled,
      };

  return (
    <Component
      {...componentProps}
      className={buttonStyle.className}
      style={buttonStyle.style}
      {...rest}
    >
      {children}
    </Component>
  );
}

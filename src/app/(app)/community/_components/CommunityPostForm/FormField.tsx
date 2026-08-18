import { cn } from '@/lib/cn';

type FormFieldProps = {
  label: string;
  labelClassName?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function FormField({
  label,
  labelClassName,
  required = false,
  children,
  className,
}: FormFieldProps) {
  return (
    <label className={cn('flex flex-col gap-2 tracking-normal', className)}>
      <span className={cn('flex gap-0.5', labelClassName)}>
        <span>{label}</span>
        {required && <span className="text-secondary-800">*</span>}
      </span>

      {children}
    </label>
  );
}

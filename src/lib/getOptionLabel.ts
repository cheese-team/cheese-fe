type Option = {
  label: string;
  value: string;
};

export function getOptionLabel(options: readonly Option[], value?: string) {
  return options.find((option) => option.value === value)?.label ?? value ?? '';
}

import { Field } from '@/types/community/community';

export type FieldSelectValue = Field | 'FE_BE' | '';

export const toFieldSelectValue = (fields?: Field[]): FieldSelectValue => {
  if (!fields?.length) return '';
  if (fields.includes('FE') && fields.includes('BE')) return 'FE_BE';

  return fields[0];
};

export const toFieldArray = (value: FieldSelectValue): Field[] => {
  if (!value) return [];
  if (value === 'FE_BE') return ['FE', 'BE'];

  return [value];
};

import { ContactMethod } from '@/types/profile';

export const FIELD_OPTIONS = [
  { label: 'FE', value: 'FE' },
  { label: 'BE', value: 'BE' },
  { label: 'FE, BE', value: 'FE_BE' },
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { label: '인턴직', value: 'intern' },
  { label: '계약직', value: 'contract' },
  { label: '정규직', value: 'fullTime' },
];

export const EDUCATION_OPTIONS = [
  { label: '대졸', value: 'college' },
  { label: '초대졸', value: 'associate' },
  { label: '고졸', value: 'highSchool' },
  { label: '대학원(석사/박사)', value: 'graduateSchool' },
  { label: '학력무관', value: 'none' },
];

export const CAREER_OPTIONS = [
  { label: '신입', value: 'new' },
  { label: '경력', value: 'experienced' },
  { label: '경력무관', value: 'any' },
];

export const WORK_METHOD_OPTIONS = [
  { label: '온라인', value: 'online' },
  { label: '오프라인', value: 'offline' },
  { label: '온/오프라인 병행', value: 'online/offline' },
];

export const CONTACT_METHOD_OPTIONS = [
  { label: '이메일', value: 'email' },
  { label: '오픈 카카오톡', value: 'kakaoOpenChat' },
  { label: '구글 폼', value: 'googleForm' },
] satisfies readonly {
  label: string;
  value: ContactMethod;
}[];

import type {
  AccountSettings,
  CompanyProfile,
  ContactSettings,
  PersonalProfile,
  ProfileDocument,
} from '@/types/profile';

export type MypageModalType = 'text' | 'document' | 'confirm' | 'select';

export type MypageItemSection =
  | 'personalProfile'
  | 'companyProfile'
  | 'accountSettings'
  | 'accountAction';

export type MypageItemField =
  | keyof PersonalProfile
  | keyof CompanyProfile
  | keyof AccountSettings
  | 'updatePassword'
  | 'logout'
  | 'deleteAccount';

export type MypageModalItem = {
  section: MypageItemSection;
  field: MypageItemField;
  label: string;
  value?: string;
  contactUrl?: string;
  document?: ProfileDocument;
  buttonText: string;
  options?: string[];
  modalType: MypageModalType;
  onConfirm?: () => void;
};

export type MypageEditValue = string | ProfileDocument;

export type SelectEditValue = string | ContactSettings;

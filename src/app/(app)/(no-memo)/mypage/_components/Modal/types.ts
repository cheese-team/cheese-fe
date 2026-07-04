import { ProfileDocument } from '@/types/profile';

export type MypageModalType = 'text' | 'document' | 'confirm' | 'select';

export type MypageModalItem = {
  label: string;
  value?: string;
  document?: ProfileDocument;
  buttonText?: string;
  options?: string[];
  modalType: MypageModalType;
  onConfirm?: () => void;
};

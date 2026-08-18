import { ReactNode } from 'react';

import {
  CompanyIcon,
  DocumentsIcon,
  EmailIcon,
  IndustryIcon,
  LocationIcon,
  LogoutIcon,
  PasswordIcon,
  SkillsIcon,
  StarIcon,
  UserIcon as NicknameIcon,
  UsersIcon as EmployeeIcon,
} from '@/assets/icons/settings';
import InterestsIcon from '@/assets/icons/common/like-outline.svg';
import CalendarIcon from '@/assets/icons/common/calendar.svg';
import ContactIcon from '@/assets/icons/common/contact.svg';
import DeleteIcon from '@/assets/icons/common/delete.svg';
import EditIcon from '@/assets/icons/common/edit.svg';
import PlusIcon from '@/assets/icons/common/plus.svg';

import { getOptionLabel } from '@/lib/getOptionLabel';
import { CONTACT_METHOD_OPTIONS } from '@/constants/profileOptions';

import type {
  AccountSettings,
  CompanyProfile,
  PersonalProfile,
  ProfileDocument,
} from '@/types/profile';

import type { MypageItemField, MypageItemSection, MypageModalType } from '../Modal/types';

type SettingItemData = {
  section: MypageItemSection;
  field: MypageItemField;
  label: string;
  value?: string;
  contactUrl?: string;
  document?: ProfileDocument;
  urlLabel?: string;
  icon: ReactNode;
  buttonIcon: ReactNode;
  buttonText: string;
  modalType?: MypageModalType;
  options?: string[];
  danger?: boolean;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
}

export function getPersonalProfileItems(profile: PersonalProfile): SettingItemData[] {
  return [
    {
      section: 'personalProfile',
      field: 'nickname',
      label: '닉네임',
      value: profile.nickname,
      icon: <NicknameIcon className="h-6" />,
      buttonIcon: <EditIcon className="h-[14px]" />,
      buttonText: '변경',
      modalType: 'text',
    },
    {
      section: 'personalProfile',
      field: 'interestedJob',
      label: '관심직무',
      value: profile.interestedJob,
      icon: <StarIcon className="h-6" />,
      buttonIcon: <EditIcon className="h-[14px]" />,
      buttonText: '변경',
      modalType: 'text',
    },
    {
      section: 'personalProfile',
      field: 'coverLetter',
      label: '자기소개서',
      document: profile.coverLetter,
      urlLabel: `${profile.nickname} 자기소개서 URL`,
      icon: <DocumentsIcon className="h-6" />,
      buttonIcon: <PlusIcon className="h-3" />,
      buttonText: '추가',
      modalType: 'document',
    },
    {
      section: 'personalProfile',
      field: 'additionalDocument',
      label: '이력서 및 기타문서',
      document: profile.additionalDocument,
      urlLabel: `${profile.nickname} 이력서 및 기타문서 URL`,
      icon: <CompanyIcon className="h-6" />,
      buttonIcon: <PlusIcon className="h-3" />,
      buttonText: '추가',
      modalType: 'document',
    },
    {
      section: 'personalProfile',
      field: 'skills',
      label: '내 스킬',
      value: profile.skills.join(', '),
      icon: <SkillsIcon className="h-6" />,
      buttonIcon: <PlusIcon className="h-3" />,
      buttonText: '추가',
      modalType: 'text',
    },
    {
      section: 'personalProfile',
      field: 'interests',
      label: '내 관심분야',
      value: profile.interests.join(', '),
      icon: <InterestsIcon className="h-6" />,
      buttonIcon: <PlusIcon className="h-3" />,
      buttonText: '추가',
      modalType: 'text',
    },
  ];
}

export function getCompanyProfileItems(profile: CompanyProfile): SettingItemData[] {
  return [
    {
      section: 'companyProfile',
      field: 'companyName',
      label: '기업명',
      value: profile.companyName,
      icon: <NicknameIcon className="h-6" />,
      buttonIcon: <EditIcon className="h-[14px]" />,
      buttonText: '변경',
      modalType: 'text',
    },
    {
      section: 'companyProfile',
      field: 'representativeName',
      label: '대표자명',
      value: profile.representativeName,
      icon: <StarIcon className="h-6" />,
      buttonIcon: <EditIcon className="h-[14px]" />,
      buttonText: '변경',
      modalType: 'text',
    },
    {
      section: 'companyProfile',
      field: 'companyType',
      label: '기업구분',
      value: profile.companyType,
      icon: <DocumentsIcon className="h-6" />,
      buttonIcon: <PlusIcon className="h-3" />,
      buttonText: '추가',
      options: ['스타트업', '중소기업', '중견기업', '대기업'],
      modalType: 'select',
    },
    {
      section: 'companyProfile',
      field: 'resumeTemplate',
      label: '이력서 양식 및 기업 홈페이지',
      document: profile.resumeTemplate,
      urlLabel: `${profile.companyName} 기업 홈페이지 URL`,
      icon: <CompanyIcon className="h-6" />,
      buttonIcon: <PlusIcon className="h-3" />,
      buttonText: '추가',
      modalType: 'document',
    },
    {
      section: 'companyProfile',
      field: 'industryType',
      label: '산업구분',
      value: profile.industryType.join(', '),
      icon: <IndustryIcon className="h-6" />,
      buttonIcon: <PlusIcon className="h-3" />,
      buttonText: '추가',
      modalType: 'text',
    },
    {
      section: 'companyProfile',
      field: 'employeeCount',
      label: '사원수',
      value: `${profile.employeeCount}명`,
      icon: <EmployeeIcon className="h-6" />,
      buttonIcon: <PlusIcon className="h-3" />,
      buttonText: '추가',
      modalType: 'text',
    },
    {
      section: 'companyProfile',
      field: 'foundedAt',
      label: '설립일',
      value: formatDate(profile.foundedAt),
      icon: <CalendarIcon className="h-6" />,
      buttonIcon: <PlusIcon className="h-3" />,
      buttonText: '추가',
      modalType: 'text',
    },
  ];
}

export function getAccountItems(profile: AccountSettings): SettingItemData[] {
  return [
    {
      section: 'accountSettings',
      field: 'contactMethod',
      label: '선호하는 연락방식',
      value: getOptionLabel(CONTACT_METHOD_OPTIONS, profile.contactMethod),
      contactUrl: profile.contactUrl,
      icon: <ContactIcon className="h-6" />,
      buttonIcon: <EditIcon className="h-[14px]" />,
      buttonText: '변경',
      options: CONTACT_METHOD_OPTIONS.map((option) => option.label),
      modalType: 'select',
    },
    {
      section: 'accountSettings',
      field: 'email',
      label: '이메일',
      value: profile.email,
      icon: <EmailIcon className="h-6" />,
      buttonIcon: <EditIcon className="h-[14px]" />,
      buttonText: '변경',
      modalType: 'text',
    },
    {
      section: 'accountAction',
      field: 'updatePassword',
      label: '비밀번호',
      value: `마지막 변경일: ${formatDate(profile.passwordUpdatedAt)}`,
      icon: <PasswordIcon className="h-6" />,
      buttonIcon: <EditIcon className="h-[14px]" />,
      buttonText: '변경',
    },
    {
      section: 'accountSettings',
      field: 'address',
      label: '주소',
      value: profile.address,
      icon: <LocationIcon className="h-6" />,
      buttonIcon: <EditIcon className="h-[14px]" />,
      buttonText: '변경',
      modalType: 'text',
    },
    {
      section: 'accountAction',
      field: 'logout',
      label: '로그아웃',
      value: '모든 기기에서 로그아웃 됩니다',
      icon: <LogoutIcon className="h-6" />,
      buttonIcon: <LogoutIcon className="h-[14px]" />,
      buttonText: '로그아웃',
      modalType: 'confirm',
    },
    {
      section: 'accountAction',
      field: 'deleteAccount',
      label: '내 계정 삭제',
      value: '계정을 영구적으로 삭제하고 지금 까지의 활동기록을 모두 제거 합니다',
      icon: <DeleteIcon className="h-6" />,
      buttonIcon: <DeleteIcon className="h-[14px]" />,
      buttonText: '계정삭제',
      modalType: 'confirm',
      danger: true,
    },
  ];
}

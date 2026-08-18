'use client';

import { useEffect, useRef, useState } from 'react';

import ProfileImage from '@/components/common/ProfileImage';
import { Button } from '@/components/common/Button';
import CategoryTabs, { type CategoryTabItem } from '@/components/common/CategoryTabs';

import PersonalProfiles from './_components/Profiles/PersonalProfiles';
import CompanyProfiles from './_components/Profiles/CompanyProfiles';
import AccountSettings from './_components/Profiles/AccountSettings';
import MypageModalRenderer from './_components/Modal/MypageModalRenderer';
import { useMypageModal } from './_components/Modal/useMypageModal';
import ConfirmModal from './_components/Modal/ConfirmModal';

import { CompanyIcon, PersonalIcon } from '@/assets/icons/settings';

import type { ContactSettings, ProfileDocument, ProfileType } from '@/types/profile';
import type { MypageItemField, MypageItemSection } from './_components/Modal/types';

import { mockMypage } from '@/mocks/profile/userProfiles';

const PROFILE_SWITCH_OPTIONS: CategoryTabItem<ProfileType>[] = [
  {
    label: '개인 프로필',
    value: 'personal',
    icon: PersonalIcon,
  },
  {
    label: '기업 프로필',
    value: 'company',
    icon: CompanyIcon,
  },
];

export default function MyPage() {
  const [mypage, setMypage] = useState(mockMypage);
  const [activeProfileType, setActiveProfileType] = useState<ProfileType>(
    mockMypage.activeProfileType,
  );
  const [pendingProfileType, setPendingProfileType] = useState<ProfileType | null>(null);

  const previewImageUrlsRef = useRef<Record<ProfileType, string | null>>({
    personal: null,
    company: null,
  });

  const { editingItem, openModal, closeModal } = useMypageModal();

  useEffect(() => {
    return () => {
      Object.values(previewImageUrlsRef.current).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });

      previewImageUrlsRef.current = {
        personal: null,
        company: null,
      };
    };
  }, []);

  const isPersonalProfile = activeProfileType === 'personal';
  const nextProfileLabel = PROFILE_SWITCH_OPTIONS.find(
    (option) => option.value === pendingProfileType,
  )?.label;

  const profileHeader = isPersonalProfile
    ? {
        imageUrl: mypage.personalProfile.profileImageUrl,
        name: mypage.personalProfile.nickname,
        subText: mypage.personalProfile.interestedJob,
      }
    : {
        imageUrl: mypage.companyProfile.profileImageUrl,
        name: mypage.companyProfile.companyName,
        subText: mypage.companyProfile.companyType,
      };

  const handleChangeProfileType = (value: ProfileType) => {
    if (value === activeProfileType) return;

    setPendingProfileType(value);
  };

  const handleConfirmProfileChange = () => {
    if (!pendingProfileType) return;

    // TODO:
    // - 프로필 전환 API 호출
    // - activeProfileType 전역 상태 업데이트
    // - 사이드바 및 전체 서비스 프로필 동기화
    setActiveProfileType(pendingProfileType);
    setPendingProfileType(null);
  };

  const handleCancelProfileChange = () => {
    setPendingProfileType(null);
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const previousUrl = previewImageUrlsRef.current[activeProfileType];

    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }

    const imageUrl = URL.createObjectURL(file);
    previewImageUrlsRef.current[activeProfileType] = imageUrl;

    setMypage((prev) => {
      if (activeProfileType === 'personal') {
        return {
          ...prev,
          personalProfile: {
            ...prev.personalProfile,
            profileImageUrl: imageUrl,
          },
        };
      }

      return {
        ...prev,
        companyProfile: {
          ...prev.companyProfile,
          profileImageUrl: imageUrl,
        },
      };
    });
  };

  // TODO 1:
  // - 이미지 업로드 API 연동
  // - React Query(또는 전역 상태)와 연동하여 사이드바 프로필 이미지까지 함께 갱신
  // TODO 2:
  // - employeeCount는 number input으로 분리하여 빈 값 처리 및 숫자 입력 보장
  // - foundedAt은 date input으로 분리하여 날짜 형식 보장
  const handleSaveMypageItem = (
    section: MypageItemSection,
    field: MypageItemField,
    value: string | ProfileDocument | ContactSettings,
  ) => {
    if (section === 'accountAction') return;

    setMypage((prev) => {
      if (section === 'personalProfile') {
        let nextValue: unknown = value;

        if ((field === 'skills' || field === 'interests') && typeof value === 'string') {
          nextValue = value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        }

        const personalField = field as keyof typeof prev.personalProfile;

        return {
          ...prev,
          personalProfile: {
            ...prev.personalProfile,
            [personalField]: nextValue,
          },
        };
      }

      if (section === 'companyProfile') {
        let nextValue: unknown = value;

        if (field === 'industryType' && typeof value === 'string') {
          nextValue = value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        }

        if (field === 'employeeCount' && typeof value === 'string') {
          nextValue = Number(value.replace(/[^0-9]/g, ''));
        }

        const companyField = field as keyof typeof prev.companyProfile;

        return {
          ...prev,
          companyProfile: {
            ...prev.companyProfile,
            [companyField]: nextValue,
          },
        };
      }

      if (section === 'accountSettings') {
        if (field === 'contactMethod' && typeof value === 'object' && 'contactMethod' in value) {
          return {
            ...prev,
            accountSettings: {
              ...prev.accountSettings,
              contactMethod: value.contactMethod,
              contactUrl: value.contactUrl,
            },
          };
        }

        const accountField = field as keyof typeof prev.accountSettings;

        return {
          ...prev,
          accountSettings: {
            ...prev.accountSettings,
            [accountField]: value,
          },
        };
      }

      return prev;
    });

    closeModal();
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <ProfileImage src={profileHeader.imageUrl} />

            <div className="flex flex-col text-gray-700">
              <span className="text-[20px] font-bold">{profileHeader.name}</span>
              <span className="text-[14px]">{profileHeader.subText}</span>
            </div>
          </div>

          <label className="cursor-pointer">
            <Button asChild variant="outlineLightGray" size={38} paddingX={8}>
              <span>프로필 사진 변경</span>
            </Button>

            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleProfileImageChange}
            />
          </label>
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-[20px] font-medium text-gray-700">프로필 설정</h2>

          <CategoryTabs
            items={PROFILE_SWITCH_OPTIONS}
            activeValue={activeProfileType}
            onChange={handleChangeProfileType}
            size="sm"
          />

          {isPersonalProfile ? (
            <PersonalProfiles profile={mypage.personalProfile} onOpenModal={openModal} />
          ) : (
            <CompanyProfiles profile={mypage.companyProfile} onOpenModal={openModal} />
          )}

          <AccountSettings profile={mypage.accountSettings} onOpenModal={openModal} />

          <MypageModalRenderer
            editingItem={editingItem}
            onClose={closeModal}
            onSave={handleSaveMypageItem}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={pendingProfileType !== null}
        onClose={handleCancelProfileChange}
        onConfirm={handleConfirmProfileChange}
        title="프로필을 전환하시겠습니까?"
        description={`전환 후 ${nextProfileLabel}로 서비스가 이용됩니다.`}
        buttonText="전환하기"
      />
    </>
  );
}

'use client';

import ProfileImage from '@/components/common/ProfileImage';
import { Button } from '@/components/common/Button';

import PersonalProfiles from './_components/Profiles/PersonalProfiles';
import CompanyProfiles from './_components/Profiles/CompanyProfiles';
import AccountSettings from './_components/Profiles/AccountSettings';
import MypageModalRenderer from './_components/Modal/MypageModalRenderer';
import { useMypageModal } from './_components/Modal/useMypageModal';

import { useMypage } from '@/queries/mypage/useMypage';
import { useUpdatePersonalProfile } from '@/queries/mypage/useUpdatePersonalProfile';
import { useUpdateCompanyProfile } from '@/queries/mypage/useUpdateCompanyProfile';
import { useUpdateAccountSettings } from '@/queries/mypage/useUpdateAccountSettings';
import { useUploadFile } from '@/queries/files/useUploadFile';

import type { ContactSettings, ProfileDocument } from '@/types/profile';
import type { MypageItemField, MypageItemSection } from './_components/Modal/types';

// TODO: 연락용 이메일 변경 플로우 연동 (contact-change 이메일 인증 후 요청)
export default function MyPage() {
  const { data: mypage, isPending: isMypagePending, isError: isMypageError } = useMypage();

  const { mutateAsync: updatePersonalProfile, isPending: isPersonalProfilePending } =
    useUpdatePersonalProfile();
  const { mutateAsync: updateCompanyProfile, isPending: isCompanyProfilePending } =
    useUpdateCompanyProfile();
  const { mutateAsync: updateAccountSettings, isPending: isAccountSettingsPending } =
    useUpdateAccountSettings();
  const { mutateAsync: uploadFile, isPending: isUploadFilePending } = useUploadFile();

  const { editingItem, openModal, closeModal } = useMypageModal();

  if (isMypagePending) {
    return <div>로딩 중...</div>;
  }

  if (isMypageError || !mypage) {
    return <div>마이페이지 정보를 불러오지 못했습니다.</div>;
  }

  const profileHeader =
    mypage.profileType === 'personal'
      ? {
          imageUrl: mypage.profile.profileImageUrl,
          name: mypage.profile.nickname,
          subText: mypage.profile.interestedJob,
        }
      : {
          imageUrl: mypage.profile.profileImageUrl,
          name: mypage.profile.companyName,
          subText: mypage.profile.companyType,
        };

  const isMypageMutating =
    isPersonalProfilePending ||
    isCompanyProfilePending ||
    isAccountSettingsPending ||
    isUploadFilePending;

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = event.target.files?.[0];

    if (!file || isMypageMutating) return;

    try {
      const uploadedFile = await uploadFile({
        file,
      });

      if (mypage.profileType === 'personal') {
        const personalProfileData = {
          nickname: mypage.profile.nickname,
          profileImageUrl: uploadedFile.url,
          interestedJob: mypage.profile.interestedJob,
          coverLetter: mypage.profile.coverLetter,
          additionalDocument: mypage.profile.additionalDocument,
          skills: mypage.profile.skills,
          interests: mypage.profile.interests,
          contactMethod: mypage.profile.contactMethod,
          contactUrl: mypage.profile.contactUrl,
        };

        await updatePersonalProfile({
          data: personalProfileData,
        });
      } else {
        const companyProfileData = {
          companyName: mypage.profile.companyName,
          profileImageUrl: uploadedFile.url,
          representativeName: mypage.profile.representativeName,
          companyType: mypage.profile.companyType,
          resumeTemplate: mypage.profile.resumeTemplate,
          industryType: mypage.profile.industryType,
          employeeCount: mypage.profile.employeeCount,
          foundedAt: mypage.profile.foundedAt,
          contactMethod: mypage.profile.contactMethod,
          contactUrl: mypage.profile.contactUrl,
        };

        await updateCompanyProfile({
          data: companyProfileData,
        });
      }
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      alert('프로필 이미지 변경에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      input.value = '';
    }
  };

  const handleSaveMypageItem = async (
    section: MypageItemSection,
    field: MypageItemField,
    value: string | ProfileDocument | ContactSettings,
  ) => {
    if (isMypageMutating || section === 'accountAction') return;

    try {
      if (section === 'personalProfile' && mypage.profileType === 'personal') {
        let nextValue: unknown = value;

        if ((field === 'skills' || field === 'interests') && typeof value === 'string') {
          nextValue = value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        }

        const personalProfileData = {
          nickname: mypage.profile.nickname,
          profileImageUrl: mypage.profile.profileImageUrl,
          interestedJob: mypage.profile.interestedJob,
          coverLetter: mypage.profile.coverLetter,
          additionalDocument: mypage.profile.additionalDocument,
          skills: mypage.profile.skills,
          interests: mypage.profile.interests,
          contactMethod: mypage.profile.contactMethod,
          contactUrl: mypage.profile.contactUrl,
        };

        await updatePersonalProfile({
          data: { ...personalProfileData, [field]: nextValue },
        });

        closeModal();
      }

      if (section === 'companyProfile' && mypage.profileType === 'company') {
        let nextValue: unknown = value;

        if (field === 'industryType' && typeof value === 'string') {
          nextValue = value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        }

        if (field === 'employeeCount' && typeof value === 'string') {
          if (value.trim() === '') return;

          const employeeCount = Number(value);

          if (!Number.isFinite(employeeCount) || employeeCount < 0) return;

          nextValue = employeeCount;
        }

        const companyProfileData = {
          companyName: mypage.profile.companyName,
          profileImageUrl: mypage.profile.profileImageUrl,
          representativeName: mypage.profile.representativeName,
          companyType: mypage.profile.companyType,
          resumeTemplate: mypage.profile.resumeTemplate,
          industryType: mypage.profile.industryType,
          employeeCount: mypage.profile.employeeCount,
          foundedAt: mypage.profile.foundedAt,
          contactMethod: mypage.profile.contactMethod,
          contactUrl: mypage.profile.contactUrl,
        };

        await updateCompanyProfile({
          data: { ...companyProfileData, [field]: nextValue },
        });

        closeModal();
      }

      if (section === 'accountSettings') {
        const accountSettingsData = {
          contactMethod: mypage.accountSettings.contactMethod,
          contactUrl: mypage.accountSettings.contactUrl,
          passwordUpdatedAt: mypage.accountSettings.passwordUpdatedAt,
          address: mypage.accountSettings.address,
        };

        const nextAccountSettingsData =
          field === 'contactMethod' && typeof value === 'object' && 'contactMethod' in value
            ? {
                ...accountSettingsData,
                contactMethod: value.contactMethod,
                contactUrl: value.contactUrl,
              }
            : {
                ...accountSettingsData,
                [field]: value,
              };

        await updateAccountSettings({
          data: nextAccountSettingsData,
        });

        closeModal();
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('프로필 변경에 실패했습니다. 다시 시도해 주세요.');
    }
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
              disabled={isMypageMutating}
              className="sr-only"
              onChange={handleProfileImageChange}
            />
          </label>
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-[20px] font-medium text-gray-700">프로필 설정</h2>

          {mypage.profileType === 'personal' ? (
            <PersonalProfiles profile={mypage.profile} onOpenModal={openModal} />
          ) : (
            <CompanyProfiles profile={mypage.profile} onOpenModal={openModal} />
          )}

          <AccountSettings profile={mypage.accountSettings} onOpenModal={openModal} />

          <MypageModalRenderer
            editingItem={editingItem}
            onClose={closeModal}
            onSave={handleSaveMypageItem}
            isPending={isMypageMutating}
          />
        </div>
      </div>
    </>
  );
}

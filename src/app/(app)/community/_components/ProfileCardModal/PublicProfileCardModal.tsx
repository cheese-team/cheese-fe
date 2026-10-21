'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import BaseModal from '@/components/common/Modal';

import PersonalProfileCardModal from './PersonalProfileCardModal';
import CompanyProfileCardModal from './CompanyProfileCardModal';
import { usePublicProfileDialogFocus } from './usePublicProfileDialogFocus';

import { ApiError } from '@/api/client';
import { usePublicProfile } from '@/queries/users/usePublicProfile';

type PublicProfileCardModalProps = {
  userId: string | undefined;
  isOpen: boolean;
  onClose: () => void;
};

export default function PublicProfileCardModal({
  userId,
  isOpen,
  onClose,
}: PublicProfileCardModalProps) {
  const router = useRouter();

  const dialogRef = usePublicProfileDialogFocus(isOpen);
  const alertedErrorRef = useRef<Error | null>(null);

  const { data: profile, error } = usePublicProfile(userId, isOpen);

  useEffect(() => {
    if (!isOpen) {
      alertedErrorRef.current = null;
      return;
    }

    if (!error && userId) return;

    if (error && alertedErrorRef.current === error) return;

    const status = error instanceof ApiError ? error.status : undefined;

    const message =
      !userId || status === 404
        ? '프로필 정보가 없습니다.'
        : status === 401
          ? '로그인 정보가 만료되었습니다. 다시 로그인해 주세요.'
          : status === 403
            ? '프로필을 확인할 권한이 없습니다.'
            : '프로필을 불러오지 못했습니다.';

    if (error) {
      alertedErrorRef.current = error;
    }

    window.alert(message);

    if (status === 401) {
      onClose();
      router.replace('/login');
      return;
    }

    onClose();
  }, [isOpen, userId, error, onClose, router]);

  if (!isOpen) return null;

  if (!error && profile) {
    return profile.profileType === 'personal' ? (
      <PersonalProfileCardModal isOpen onClose={onClose} dialogRef={dialogRef} profile={profile} />
    ) : (
      <CompanyProfileCardModal isOpen onClose={onClose} dialogRef={dialogRef} profile={profile} />
    );
  }

  if (error || !userId) return null;

  return (
    <BaseModal isOpen onClose={onClose} scope="content" hasOverlay>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="프로필 불러오는 중"
        tabIndex={-1}
        className="bg-bg-2 flex flex-col items-center gap-4 rounded-[10px] px-12 py-10"
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-700"
          aria-hidden="true"
        />

        <p role="status" className="text-[16px] text-gray-700">
          프로필을 불러오는 중입니다.
        </p>
      </div>
    </BaseModal>
  );
}

import { useRouter } from 'next/navigation';

import BaseModal from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

import PersonalProfileCardModal from './PersonalProfileCardModal';
import CompanyProfileCardModal from './CompanyProfileCardModal';

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

  const { data: profile, isPending, error, refetch, isFetching } = usePublicProfile(userId, isOpen);

  if (!isOpen) return null;

  if (!error && profile) {
    return profile.profileType === 'personal' ? (
      <PersonalProfileCardModal isOpen onClose={onClose} profile={profile} />
    ) : (
      <CompanyProfileCardModal isOpen onClose={onClose} profile={profile} />
    );
  }

  const status = error instanceof ApiError ? error.status : undefined;

  const notFound = !userId || status === 404;

  const message = notFound
    ? '프로필 정보가 없습니다.'
    : status === 401
      ? '로그인 정보가 만료되었습니다. 다시 로그인해 주세요.'
      : status === 403
        ? '프로필을 확인할 권한이 없습니다.'
        : error
          ? '프로필을 불러오지 못했습니다.'
          : isPending
            ? '프로필을 불러오는 중입니다.'
            : '프로필 정보가 없습니다.';

  const canRetry = Boolean(error) && !notFound && status !== 401 && status !== 403;

  return (
    <BaseModal isOpen onClose={onClose} scope="content" hasOverlay>
      <div className="bg-bg-2 flex flex-col gap-6 rounded-[10px] p-10">
        <h2 className="text-[24px] font-bold">프로필</h2>

        <p role={error && !notFound ? 'alert' : 'status'}>{message}</p>

        <div className="flex justify-end gap-2">
          {canRetry && (
            <Button disabled={isFetching} onClick={() => void refetch()}>
              다시 시도
            </Button>
          )}

          {status === 401 ? (
            <Button onClick={() => router.replace('/login')}>로그인하기</Button>
          ) : (
            <Button variant="outlineGray" onClick={onClose}>
              닫기
            </Button>
          )}
        </div>
      </div>
    </BaseModal>
  );
}

import BaseModal from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { ApiError } from '@/api/client';
import { usePublicProfile } from '@/queries/users/usePublicProfile';
import PersonalProfileCardModal from './PersonalProfileCardModal';
import CompanyProfileCardModal from './CompanyProfileCardModal';

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
  const { data: profile, isPending, error, refetch, isFetching } = usePublicProfile(userId, isOpen);

  if (!isOpen) return null;

  if (!error && profile) {
    return profile.profileType === 'personal' ? (
      <PersonalProfileCardModal isOpen onClose={onClose} profile={profile} />
    ) : (
      <CompanyProfileCardModal isOpen onClose={onClose} profile={profile} />
    );
  }

  const notFound = !userId || (error instanceof ApiError && error.status === 404);
  const message = notFound
    ? '공개 프로필 정보가 없습니다.'
    : error
      ? '프로필을 불러오지 못했습니다.'
      : isPending
        ? '프로필을 불러오는 중입니다.'
        : '공개 프로필 정보가 없습니다.';

  return (
    <BaseModal isOpen onClose={onClose} scope="content" hasOverlay>
      <div className="bg-bg-2 flex flex-col gap-6 rounded-[10px] p-10">
        <h2 className="text-[24px] font-bold">공개 프로필</h2>
        <p role={error && !notFound ? 'alert' : 'status'}>{message}</p>
        <div className="flex justify-end gap-2">
          {error && !notFound && (
            <Button disabled={isFetching} onClick={() => void refetch()}>
              다시 시도
            </Button>
          )}
          <Button variant="outlineGray" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}

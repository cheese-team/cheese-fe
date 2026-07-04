'use client';

import { useRouter } from 'next/navigation';
import AuthConfirmModal from '../../_components/AuthConfirmModal';

type DoneModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function DoneModal({ isOpen, onClose }: DoneModalProps) {
  const router = useRouter();

  return (
    <AuthConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title="비밀번호 변경 완료"
      description="비밀번호가 성공적으로 변경되었습니다"
      primaryText="로그인하러 가기"
      onPrimaryClick={() => {
        onClose();
        router.push('/login');
      }}
    />
  );
}

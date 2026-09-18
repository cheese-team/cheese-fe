import { useRouter } from 'next/navigation';

import TextEditModal from './TextEditModal';
import DocumentEditModal from './DocumentEditModal';
import SelectEditModal from './SelectEditModal';
import ConfirmModal from './ConfirmModal';

import { useLogout } from '@/queries/auth/useLogout';
import { useDeleteMe } from '@/queries/auth/useDeleteMe';

import type { ContactSettings, ProfileDocument } from '@/types/profile';
import type { MypageModalItem } from './types';

type MypageModalRendererProps = {
  editingItem: MypageModalItem | null;
  onClose: () => void;
  onSave: (
    section: MypageModalItem['section'],
    field: MypageModalItem['field'],
    value: string | ProfileDocument | ContactSettings,
  ) => void;
  isPending: boolean;
};

export default function MypageModalRenderer({
  editingItem,
  onClose,
  onSave,
  isPending,
}: MypageModalRendererProps) {
  const router = useRouter();

  const {
    mutate: logout,
    isPending: isLogoutPending,
    isError: isLogoutError,
    reset: resetLogout,
  } = useLogout();
  const {
    mutate: deleteMe,
    isPending: isDeletePending,
    isError: isDeleteError,
    reset: resetDeleteMe,
  } = useDeleteMe();

  if (!editingItem) return null;

  const modalKey = `${editingItem.modalType}-${editingItem.label}`;

  const isTextModal = editingItem?.modalType === 'text';
  const isDocumentModal = editingItem?.modalType === 'document';
  const isSelectModal = editingItem?.modalType === 'select';
  const isConfirmModal = editingItem?.modalType === 'confirm';

  const hasOpenKakaoInput =
    editingItem.section === 'accountSettings' && editingItem.field === 'contactMethod';
  const isLogout = isConfirmModal && editingItem.field === 'logout';
  const isDeleteAccount = isConfirmModal && editingItem.field === 'deleteAccount';

  const confirmModalTitle = isLogout
    ? '계정에서 로그아웃 하시겠습니까?'
    : '정말 계정을 삭제하시겠습니까?';

  const confirmModalDescription = isLogout
    ? '접속한 기기에서 로그아웃 됩니다'
    : `계정을 영구적으로 삭제하고 지금까지의 활동기록을 모두 제거합니다.
    계정을 삭제하면 되돌릴 수 없습니다`;

  const confirmButtonClassName = isLogout ? 'bg-tag-red-100 text-error' : 'bg-error text-gray-50';

  const confirmTitleClassName = isDeleteAccount ? 'text-error' : '';

  const handleConfirm = () => {
    if (editingItem.field === 'logout') {
      logout(undefined, {
        onSuccess: () => {
          onClose();
          router.replace('/');
        },
      });

      return;
    }

    if (editingItem.field === 'deleteAccount') {
      deleteMe(undefined, {
        onSuccess: () => {
          onClose();
          router.replace('/');
        },
      });

      return;
    }

    onClose();
  };

  const isConfirmPending = (isLogout && isLogoutPending) || (isDeleteAccount && isDeletePending);

  const handleConfirmModalClose = () => {
    if (isConfirmPending) {
      return;
    }

    if (isLogout) {
      resetLogout();
    }

    if (isDeleteAccount) {
      resetDeleteMe();
    }

    onClose();
  };

  const handleEditModalClose = () => {
    if (isPending) return;

    onClose();
  };

  if (isTextModal) {
    return (
      <TextEditModal
        key={modalKey}
        isOpen
        title={`${editingItem.label} ${editingItem.buttonText}`}
        inputLabel={editingItem.label}
        value={editingItem.value}
        inputType={editingItem.inputType}
        min={editingItem.min}
        description={
          editingItem.label === '내 스킬' || editingItem.label === '내 관심분야'
            ? 'ex) HTML, CSS3, Java ...'
            : undefined
        }
        disabled={isPending}
        onClose={handleEditModalClose}
        onSave={(value) => {
          onSave(editingItem.section, editingItem.field, value);
        }}
      />
    );
  }

  if (isDocumentModal) {
    return (
      <DocumentEditModal
        key={modalKey}
        isOpen
        title={`${editingItem.label} 추가`}
        inputLabel={editingItem.label}
        document={editingItem.document}
        disabled={isPending}
        onClose={handleEditModalClose}
        onSave={(document) => {
          onSave(editingItem.section, editingItem.field, document);
        }}
      />
    );
  }

  if (isSelectModal) {
    return (
      <SelectEditModal
        key={modalKey}
        isOpen
        title={`${editingItem.label} ${editingItem.buttonText}`}
        inputLabel={editingItem.label}
        value={editingItem.value}
        contactUrl={editingItem.contactUrl}
        options={editingItem.options ?? []}
        hasOpenKakaoInput={hasOpenKakaoInput}
        disabled={isPending}
        onClose={handleEditModalClose}
        onSave={(value) => {
          onSave(editingItem.section, editingItem.field, value);
        }}
      />
    );
  }

  if (isConfirmModal) {
    return (
      <ConfirmModal
        key={modalKey}
        isOpen
        title={confirmModalTitle}
        titleClassName={confirmTitleClassName}
        description={confirmModalDescription}
        buttonText={editingItem.label}
        buttonClassName={confirmButtonClassName}
        onClose={handleConfirmModalClose}
        disabled={isConfirmPending}
        errorMessage={
          isLogout && isLogoutError
            ? '로그아웃에 실패했습니다. 다시 시도해 주세요.'
            : isDeleteAccount && isDeleteError
              ? '계정 삭제에 실패했습니다. 다시 시도해 주세요.'
              : undefined
        }
        onConfirm={handleConfirm}
      />
    );
  }

  return null;
}

import TextEditModal from '../Modal/TextEditModal';
import DocumentEditModal from '../Modal/DocumentEditModal';
import SelectEditModal from '../Modal/SelectEditModal';
import ConfirmModal from '../Modal/ConfirmModal';

import type { MypageModalItem } from '../Modal/types';

type MypageModalRendererProps = {
  editingItem: MypageModalItem | null;
  onClose: () => void;
};

export default function MypageModalRenderer({ editingItem, onClose }: MypageModalRendererProps) {
  if (!editingItem) return null;

  const modalKey = `${editingItem.modalType}-${editingItem.label}`;

  const isTextModal = editingItem?.modalType === 'text';
  const isDocumentModal = editingItem?.modalType === 'document';
  const isSelectModal = editingItem?.modalType === 'select';
  const isConfirmModal = editingItem?.modalType === 'confirm';

  const hasOpenKakaoInput = editingItem?.label === '선호하는 연락방식';
  const isLogout = isConfirmModal && editingItem.label === '로그아웃';
  const isDeleteAccount = isConfirmModal && editingItem.label === '내 계정 삭제';

  const confirmModalTitle = isLogout
    ? '계정에서 로그아웃 하시겠습니까?'
    : '정말 계정을 삭제하시겠습니까?';

  const confirmModalDescription = isLogout
    ? '접속한 기기에서 로그아웃 됩니다'
    : `계정을 영구적으로 삭제하고 지금까지의 활동기록을 모두 제거합니다.
    계정을 삭제하면 되돌릴 수 없습니다`;

  const confirmButtonClassName = isLogout ? 'bg-tag-red-100 text-error' : 'bg-error text-gray-50';

  const confirmTitleClassName = isDeleteAccount ? 'text-error' : '';

  if (isTextModal) {
    return (
      <TextEditModal
        key={modalKey}
        isOpen
        title={`${editingItem.label} ${editingItem.buttonText}`}
        inputLabel={editingItem.label}
        value={editingItem.value}
        description={
          editingItem.label === '내 스킬' || editingItem.label === '내 관심분야'
            ? 'ex) HTML, CSS3, Java ...'
            : undefined
        }
        onClose={onClose}
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
        onClose={onClose}
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
        options={editingItem.options ?? []}
        hasOpenKakaoInput={hasOpenKakaoInput}
        onClose={onClose}
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
        onClose={onClose}
        onConfirm={() => {
          if (editingItem.label === '로그아웃') {
            // TODO: 로그아웃
          }

          if (editingItem.label === '내 계정 삭제') {
            // TODO: 계정 삭제
          }

          onClose();
        }}
      />
    );
  }

  return null;
}

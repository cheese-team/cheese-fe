import TextEditModal from './TextEditModal';
import DocumentEditModal from './DocumentEditModal';
import SelectEditModal from './SelectEditModal';
import ConfirmModal from './ConfirmModal';

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
};

export default function MypageModalRenderer({
  editingItem,
  onClose,
  onSave,
}: MypageModalRendererProps) {
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
        onClose={onClose}
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
        onClose={onClose}
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
        onClose={onClose}
        onConfirm={() => {
          if (editingItem.field === 'logout') {
            // TODO: 로그아웃
          }

          if (editingItem.field === 'deleteAccount') {
            // TODO: 계정 삭제
          }

          onClose();
        }}
      />
    );
  }

  return null;
}

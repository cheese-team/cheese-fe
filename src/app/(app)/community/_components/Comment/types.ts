import type { CommunityCommentResult } from '@/types/community/comment';

export type CommentFormProps = {
  disabled?: boolean;
  profileImageUrl?: string;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
};

export type CommentItemProps = {
  disabled?: boolean;
  comment: CommunityCommentResult;
  isMine: boolean;
  isEditing: boolean;
  isMenuOpen: boolean;
  editingValue: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onToggleMenu: (commentId: string) => void;
  onStartEdit: (comment: CommunityCommentResult) => void;
  onChangeEditingValue: (value: string) => void;
  onUpdate: (commentId: string) => void;
  onCancelEdit: () => void;
  onDelete: (commentId: string) => void;
};

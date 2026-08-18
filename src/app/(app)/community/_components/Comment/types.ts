import { UserSummary } from '@/types/community/community';

export type Comment = {
  id: number;
  author: UserSummary;
  content: string;
  createdAt?: string;
};

export type CommentFormProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
};

export type CommentItemProps = {
  comment: Comment;
  isMine: boolean;
  isEditing: boolean;
  isMenuOpen: boolean;
  editingValue: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onToggleMenu: (commentId: number) => void;
  onStartEdit: (comment: Comment) => void;
  onChangeEditingValue: (value: string) => void;
  onUpdate: (commentId: number) => void;
  onCancelEdit: () => void;
  onDelete: (commentId: number) => void;
};

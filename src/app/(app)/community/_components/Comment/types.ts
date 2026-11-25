import type { CommunityCommentResult } from '@/types/community/comment';

export type CommentFormProps = {
  disabled?: boolean;
  profileImageUrl?: string;
  displayName?: string;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isReply?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
};

export type CommentItemProps = {
  disabled?: boolean;
  comment: CommunityCommentResult;
  isMine: boolean;
  isEditing: boolean;
  editingValue: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onStartEdit: (comment: CommunityCommentResult) => void;
  onChangeEditingValue: (value: string) => void;
  onUpdate: (commentId: string) => void;
  onCancelEdit: () => void;
  onDelete: (commentId: string) => void;
  onReply?: () => void;
  isReplying?: boolean;
  isPostAuthor: boolean;
};

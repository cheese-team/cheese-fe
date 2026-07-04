export type MemoColor = 'gray' | 'pink' | 'orange' | 'green' | 'blue' | 'purple';

export type Memo = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  color?: MemoColor;
  pinned?: boolean;
  imageSrc?: string;
  selected?: boolean;
  deleted?: boolean;
};

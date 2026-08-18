export type UserSummary = {
  id: number;
  profileType: 'personal' | 'company';
  nickname: string;
  email: string;
  profileImageUrl?: string;
};

export type Field = 'FE' | 'BE';

export type ApplyInfo =
  | {
      type: 'homepage';
      url: string;
    }
  | {
      type: 'direct';
    };

export type JobPost = {
  id: number;
  companyName: string;
  title: string;

  author: UserSummary;

  field: Field[];
  skills: string[];
  career: string;
  education: string;
  location: string;
  employmentType: string;
  applicantCount: number;
  deadline: string | null;

  content: string;

  createdAt: string;
  viewCount: number;
  likeCount: number;

  apply: ApplyInfo;

  isLiked: boolean;
  isApplied: boolean;
};

export type GroupPost = {
  id: number;
  field: Field[];
  title: string;

  author: UserSummary;

  recruitCount: number;
  expectedPeriod: string;
  progressType: 'online' | 'offline' | 'online/offline';
  skills: string[];
  applicantCount: number;
  deadline: string | null;

  content: string;

  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;

  isLiked: boolean;
  isApplied: boolean;
};

export type InfoPost = {
  id: number;
  category: 'question' | 'info' | 'resource';
  title: string;

  author: UserSummary;

  // TODO: content 안에 첨부된 첫 번째 이미지를 썸네일로 사용
  thumbnailUrl?: string;

  // 목록 카드 미리보기용 텍스트
  // TODO: content에서 HTML/img를 제거한 순수 텍스트
  previewText: string;

  // 상세 본문 HTML
  content: string;

  tags: string[];

  attachmentFileName?: string;
  attachmentUrl?: string;

  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;

  isLiked: boolean;
};

export type TogglePostLikeParams = {
  postId: number;
  isLiked: boolean;
};

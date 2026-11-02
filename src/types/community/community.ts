export type CommunityAuthor = {
  userId: string;
  profileType: 'personal' | 'company';
  displayName: string;
  email: string;
  profileImageUrl: string;
};

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

export type JobPostLink = ApplyInfo & { label?: string };

export type JobPost = {
  id: string;
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
  links?: JobPostLink[];

  isLiked: boolean;
  isApplied: boolean;
};

export type JobPostDetail = Omit<JobPost, 'author'> & { author: CommunityAuthor };

export type GroupPost = {
  id: string;
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

export type GroupPostDetail = Omit<GroupPost, 'author'> & { author: CommunityAuthor };

export type InfoPost = {
  id: string;
  category: 'question' | 'info' | 'resource';
  title: string;

  author: UserSummary;

  thumbnailUrl?: string;
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

export type InfoPostDetail = Omit<InfoPost, 'author'> & { author: CommunityAuthor };

export type ToggleInfoPostLikeParams = {
  infoId: string;
  isLiked: boolean;
};

export type ToggleGroupPostLikeParams = {
  groupId: string;
  isLiked: boolean;
};

export type ToggleJobPostLikeParams = {
  jobId: string;
  isLiked: boolean;
};

export type CommunityReportTargetType = 'jobs' | 'groups' | 'info' | 'comment';

export type CreateCommunityReportRequest = {
  targetType: CommunityReportTargetType;
  targetId: string;
  reason: string;
};

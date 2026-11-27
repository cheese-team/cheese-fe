import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateAdminReport } from '@/api/adminReports.api';
import { communityQueryKeys } from '@/queries/community/communityQueryKeys';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';
import { adminReportQueryKeys } from './adminReportQueryKeys';

import type { ReportListItem, UpdateAdminReportRequest } from '@/types/admin/report';

const postKeys = {
  jobs: {
    lists: communityQueryKeys.jobLists,
    details: communityQueryKeys.jobDetails,
    detail: communityQueryKeys.jobDetail,
  },
  groups: {
    lists: communityQueryKeys.groupLists,
    details: communityQueryKeys.groupDetails,
    detail: communityQueryKeys.groupDetail,
  },
  info: {
    lists: communityQueryKeys.infoLists,
    details: communityQueryKeys.infoDetails,
    detail: communityQueryKeys.infoDetail,
  },
};

export function useUpdateAdminReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      report,
      request,
    }: {
      report: ReportListItem;
      request: UpdateAdminReportRequest;
    }) => updateAdminReport(report.id, request),
    retry: false,
    onSuccess: async (_, { report, request }) => {
      const invalidate = (queryKey: readonly unknown[]) =>
        queryClient.invalidateQueries({ queryKey });
      const refresh = [invalidate(adminReportQueryKeys.all)];

      if (request.action === 'delete_target') {
        const { targetType, targetId } = report;
        refresh.push(invalidate(communityQueryKeys.dashboardPopularPosts()));

        if (targetType === 'comment') {
          // A comment report does not identify the containing post or board.
          refresh.push(
            queryClient.invalidateQueries({
              queryKey: communityQueryKeys.all,
              predicate: ({ queryKey }) =>
                (queryKey[1] === 'jobs' || queryKey[1] === 'groups' || queryKey[1] === 'info') &&
                queryKey.length === 4 &&
                queryKey[3] === 'comments',
            }),
          );
          for (const keys of Object.values(postKeys)) {
            refresh.push(invalidate(keys.lists()), invalidate(keys.details()));
          }
        } else {
          const keys = postKeys[targetType];
          refresh.push(
            invalidate(keys.lists()),
            invalidate(keys.detail(targetId)),
            invalidate(communityQueryKeys.comments(targetType, targetId)),
            invalidate(mypageQueryKeys.bookmarks(targetType)),
          );
          if (targetType === 'jobs') refresh.push(invalidate(mypageQueryKeys.jobApplications()));
          if (targetType === 'groups')
            refresh.push(invalidate(mypageQueryKeys.groupApplications()));
        }
      }

      await Promise.all(refresh);
    },
  });
}

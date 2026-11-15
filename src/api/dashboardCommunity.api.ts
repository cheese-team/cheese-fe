import { getGroupPosts, getInfoPosts, getJobPosts } from '@/api/community.api';
import { COMMUNITY_LIST_LIMIT } from '@/app/(app)/community/_constants/community';

import type { JobPostsResponse } from '@/api/community.api';
import type { GroupPost, InfoPost, JobPost } from '@/types/community/community';

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const POPULAR_POST_LIMIT = 4;

export type DashboardCommunityPosts = {
  asOf: number;
  jobs: JobPost[];
  groups: GroupPost[];
  info: InfoPost[];
};

function createPostCollector<T extends Pick<JobPost, 'id' | 'createdAt'>>(
  fetchPage: (cursor?: string) => Promise<Omit<JobPostsResponse, 'items'> & { items: T[] }>,
  asOf: number,
  signal?: AbortSignal,
) {
  const recent: T[] = [];
  const older: T[] = [];
  const postIds = new Set<string>();
  const cursors = new Set<string>();
  const cutoff = asOf - WEEK_IN_MS;
  let cursor: string | undefined;
  let hasMore = true;
  let hasReachedOlderPosts = false;

  const fetchNextPage = async () => {
    signal?.throwIfAborted();
    const page = await fetchPage(cursor);
    signal?.throwIfAborted();

    if (
      typeof page.hasMore !== 'boolean' ||
      (page.hasMore &&
        (page.items.length === 0 ||
          typeof page.nextCursor !== 'string' ||
          !page.nextCursor.trim() ||
          cursors.has(page.nextCursor)))
    ) {
      throw new Error('커뮤니티 게시글의 다음 페이지 정보를 확인할 수 없습니다.');
    }

    for (const post of page.items) {
      if (postIds.has(post.id)) continue;
      postIds.add(post.id);

      const createdAt = Date.parse(post.createdAt);

      if (!Number.isFinite(createdAt)) {
        throw new Error('커뮤니티 게시글의 작성 시각을 확인할 수 없습니다.');
      }

      if (createdAt > asOf) continue;

      if (createdAt >= cutoff) {
        recent.push(post);
      } else {
        hasReachedOlderPosts = true;

        if (older.length < POPULAR_POST_LIMIT) older.push(post);
      }
    }

    hasMore = page.hasMore;

    if (page.hasMore && page.nextCursor) {
      cursors.add(page.nextCursor);
      cursor = page.nextCursor;
    }
  };

  return {
    recent,
    older,
    async collectRecent() {
      // 최신순 응답이므로 과거 글이 나온 페이지까지 읽으면 최근 7일 수집이 끝난다.
      while (hasMore && !hasReachedOlderPosts) await fetchNextPage();
    },
    async collectOlder(count: number) {
      while (hasMore && older.length < count) await fetchNextPage();
    },
  };
}

export async function getDashboardCommunityPosts({
  signal,
}: { signal?: AbortSignal } = {}): Promise<DashboardCommunityPosts> {
  const asOf = Date.now();
  const params = { limit: COMMUNITY_LIST_LIMIT, signal };
  const jobs = createPostCollector(
    (cursor) => getJobPosts({ ...params, sort: 'latest', cursor }),
    asOf,
    signal,
  );
  const groups = createPostCollector(
    (cursor) => getGroupPosts({ ...params, sort: 'latest', cursor }),
    asOf,
    signal,
  );
  const info = createPostCollector(
    (cursor) => getInfoPosts({ ...params, sort: 'all', cursor }),
    asOf,
    signal,
  );
  const collectors = [jobs, groups, info];

  await Promise.all(collectors.map((collector) => collector.collectRecent()));

  const recentCount = collectors.reduce((count, collector) => count + collector.recent.length, 0);
  const missingCount = POPULAR_POST_LIMIT - recentCount;

  if (missingCount > 0) {
    // 각 게시판의 최신 missingCount개면 통합 보충 후보를 빠짐없이 확보할 수 있다.
    await Promise.all(collectors.map((collector) => collector.collectOlder(missingCount)));
  }

  return {
    asOf,
    jobs: [...jobs.recent, ...jobs.older],
    groups: [...groups.recent, ...groups.older],
    info: [...info.recent, ...info.older],
  };
}

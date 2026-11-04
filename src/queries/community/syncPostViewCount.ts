import { hashKey, type InfiniteData, type QueryClient, type QueryKey } from '@tanstack/react-query';

type PostViewCount = { id: string; viewCount: number };

type PostListData = InfiniteData<{ items: PostViewCount[] }>;

// Retain successful responses only for the lifetime of the overlapping list request.
const pendingViewCounts = new WeakMap<Promise<unknown>, Map<string, PostViewCount>>();

export function syncPostViewCount(
  queryClient: QueryClient,
  listKey: QueryKey,
  detailKey: QueryKey,
  post: PostViewCount,
  signal: AbortSignal,
) {
  if (signal.aborted) return;

  const queries = queryClient.getQueryCache().findAll({ queryKey: listKey });

  for (const query of queries) {
    const update = (detail: PostViewCount) => {
      // A removed list must not be recreated by a late response.
      if (queryClient.getQueryCache().get(query.queryHash) !== query) return;

      const current = query.state.data as PostListData | undefined;

      if (
        !current?.pages.some((page) =>
          page.items.some((item) => item.id === detail.id && item.viewCount < detail.viewCount),
        )
      ) {
        return;
      }

      queryClient.setQueryData<PostListData>(
        query.queryKey,
        {
          ...current,
          pages: current.pages.map((page) => {
            if (!page.items.some((item) => item.id === detail.id)) return page;

            return {
              ...page,
              items: page.items.map((item) =>
                item.id === detail.id && item.viewCount < detail.viewCount
                  ? { ...item, viewCount: detail.viewCount }
                  : item,
              ),
            };
          }),
        },
        { updatedAt: query.state.dataUpdatedAt },
      );
    };

    const pendingRequest = query.promise;

    update(post);

    if (query.state.fetchStatus !== 'idle' && pendingRequest) {
      const detailHash = hashKey(detailKey);

      let responses = pendingViewCounts.get(pendingRequest);

      if (!responses) {
        responses = new Map();
        pendingViewCounts.set(pendingRequest, responses);
      }

      responses.set(detailHash, { id: post.id, viewCount: post.viewCount });

      void pendingRequest.then(
        () => {
          if (signal.aborted) return;

          // queryFn can finish before its response is committed to the detail cache.
          const latest = responses.get(detailHash);

          if (latest) update(latest);
        },
        () => {},
      );
    }
  }
}

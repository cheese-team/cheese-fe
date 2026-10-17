import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  InfiniteQueryObserver,
  QueryClient,
  QueryClientProvider,
  QueryObserver,
  isCancelledError,
} from '@tanstack/react-query';

import { ApiError } from '../src/api/client.ts';
import { authQueryKeys } from '../src/queries/auth/authQueryKeys.ts';
import { notificationQueryKeys } from '../src/queries/notification/notificationQueryKeys.ts';
import {
  notificationListOptions,
  notificationUnreadCountOptions,
} from '../src/queries/notification/notificationQueryOptions.ts';
import {
  useNotificationUnreadCount,
  useNotifications,
} from '../src/queries/notification/useNotificationQueries.ts';

const notification = {
  id: 'notification-1',
  type: 'comment',
  message: '댓글이 등록되었습니다.',
  isRead: false,
  createdAt: '2026-10-15T00:00:00.000Z',
  sender: null,
  target: null,
};
const firstPage = { items: [notification], nextCursor: 'cursor+2/next', hasMore: true };
const lastPage = {
  items: [{ ...notification, id: 'notification-2', isRead: true }],
  nextCursor: null,
  hasMore: false,
};

function createClient(t, userId = 'user-a') {
  const client = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0, gcTime: Infinity, staleTime: Infinity } },
  });
  if (userId) client.setQueryData(authQueryKeys.me(), { account: { userId } });
  t.after(() => client.clear());
  return client;
}

function createListObserver(t, client, params = {}) {
  const observer = new InfiniteQueryObserver(
    client,
    notificationListOptions(client, { userId: 'user-a', ...params }),
  );
  t.after(() => observer.destroy());
  return observer;
}

test('첫 페이지와 다음 페이지를 순서대로 누적하고 마지막 페이지에서 중단한다', async (t) => {
  const client = createClient(t);
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url) => {
    const params = new URL(url, 'http://localhost').searchParams;
    requests.push([...params]);
    return Response.json(params.has('cursor') ? lastPage : firstPage);
  });
  const observer = createListObserver(t, client);

  assert.equal((await observer.refetch()).hasNextPage, true);
  const result = await observer.fetchNextPage();
  assert.deepEqual(result.data.pages, [firstPage, lastPage]);
  assert.deepEqual(result.data.pageParams, [undefined, firstPage.nextCursor]);
  assert.equal(result.hasNextPage, false);
  await observer.fetchNextPage();
  assert.deepEqual(requests, [
    [['limit', '20']],
    [
      ['cursor', firstPage.nextCursor],
      ['limit', '20'],
    ],
  ]);
});

for (const [name, page] of [
  ['마지막 페이지', { ...firstPage, hasMore: false }],
  ['null 커서', { ...firstPage, nextCursor: null }],
  ['빈 커서', { ...firstPage, nextCursor: '' }],
  ['문자열이 아닌 커서', { ...firstPage, nextCursor: { id: 'invalid' } }],
]) {
  test(`${name}: 첫 페이지를 다시 요청하는 무한 반복을 방지한다`, async (t) => {
    const client = createClient(t);
    const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json(page));
    const observer = createListObserver(t, client);

    assert.equal((await observer.refetch()).hasNextPage, false);
    await observer.fetchNextPage();
    assert.equal(fetchMock.mock.callCount(), 1);
  });
}

test('서버가 앞서 사용한 커서를 다시 반환하면 추가 요청을 중단한다', async (t) => {
  const client = createClient(t);
  const pages = [
    { ...firstPage, nextCursor: 'cursor-a' },
    { ...firstPage, nextCursor: 'cursor-b' },
    { ...lastPage, nextCursor: 'cursor-a', hasMore: true },
  ];
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json(pages.shift()));
  const observer = createListObserver(t, client);

  await observer.refetch();
  await observer.fetchNextPage();
  assert.equal((await observer.fetchNextPage()).hasNextPage, false);
  await observer.fetchNextPage();
  assert.equal(fetchMock.mock.callCount(), 3);
});

test('다음 페이지 오류는 기존 목록을 보존하며 재시도는 실패한 페이지를 이어받는다', async (t) => {
  const client = createClient(t);
  let failNextPage = true;
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (!new URL(url, 'http://localhost').searchParams.has('cursor')) {
      return Response.json(firstPage);
    }
    return failNextPage
      ? Response.json({ message: '일시적인 오류입니다.' }, { status: 500 })
      : Response.json(lastPage);
  });
  const observer = createListObserver(t, client);

  await observer.refetch();
  const failed = await observer.fetchNextPage();
  assert.equal(failed.isFetchNextPageError, true);
  assert.deepEqual(failed.data.pages, [firstPage]);

  failNextPage = false;
  const recovered = await observer.fetchNextPage();
  assert.equal(recovered.isFetchNextPageError, false);
  assert.deepEqual(recovered.data.pages, [firstPage, lastPage]);
});

const queries = [
  {
    name: '목록',
    options: notificationListOptions,
    Observer: InfiniteQueryObserver,
    fetch: (client, options) => client.fetchInfiniteQuery(options),
    response: lastPage,
  },
  {
    name: '미읽음 개수',
    options: notificationUnreadCountOptions,
    Observer: QueryObserver,
    fetch: (client, options) => client.fetchQuery(options),
    response: { count: 3 },
  },
];

for (const query of queries) {
  test(`${query.name}: 로그인 전에는 자동 조회와 수동 새로고침 모두 요청하지 않는다`, async (t) => {
    const client = createClient(t, null);
    const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json(query.response));
    const observer = new query.Observer(client, query.options(client, {}));
    const unsubscribe = observer.subscribe(() => {});
    t.after(unsubscribe);

    await setImmediate();
    assert.equal(observer.getCurrentResult().fetchStatus, 'idle');
    assert.equal(fetchMock.mock.callCount(), 0);
    const result = await observer.refetch();
    assert.equal(result.error.status, 401);
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  test(`${query.name}: enabled가 false이면 로그인 상태여도 자동 요청하지 않는다`, async (t) => {
    const client = createClient(t);
    const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json(query.response));
    const observer = new query.Observer(
      client,
      query.options(client, { userId: 'user-a', enabled: false }),
    );
    const unsubscribe = observer.subscribe(() => {});
    t.after(unsubscribe);

    await setImmediate();
    assert.equal(observer.getCurrentResult().fetchStatus, 'idle');
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  test(`${query.name}: 계정 전환 후 이전 계정의 조회 함수로 요청할 수 없다`, async (t) => {
    const client = createClient(t);
    const oldOptions = query.options(client, { userId: 'user-a' });
    const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json(query.response));
    client.setQueryData(authQueryKeys.me(), { account: { userId: 'user-b' } });

    await assert.rejects(
      query.fetch(client, oldOptions),
      (error) => error instanceof ApiError && error.status === 401,
    );
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  test(`${query.name}: 계정 전환 전 시작한 늦은 응답을 캐시에 저장하지 않는다`, async (t) => {
    const client = createClient(t);
    const oldOptions = query.options(client, { userId: 'user-a' });
    let release;
    t.mock.method(
      globalThis,
      'fetch',
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const pending = query.fetch(client, oldOptions);
    client.setQueryData(authQueryKeys.me(), { account: { userId: 'user-b' } });
    release(Response.json(query.response));

    await assert.rejects(pending, (error) => error instanceof ApiError && error.status === 401);
    assert.equal(client.getQueryData(oldOptions.queryKey), undefined);
    assert.equal(
      client.getQueryData(query.options(client, { userId: 'user-b' }).queryKey),
      undefined,
    );
  });

  test(`${query.name}: 로그아웃 시 캐시 초기화가 진행 중인 요청도 취소한다`, async (t) => {
    const client = createClient(t);
    let requestSignal;
    t.mock.method(globalThis, 'fetch', async (_url, options) => {
      requestSignal = options.signal;
      return new Promise((_, reject) => {
        options.signal.addEventListener('abort', () => reject(options.signal.reason), {
          once: true,
        });
      });
    });
    const options = query.options(client, { userId: 'user-a' });
    const pending = query.fetch(client, options);
    const rejected = assert.rejects(pending, isCancelledError);
    client.clear();

    await rejected;
    assert.equal(requestSignal.aborted, true);
    assert.equal(client.getQueryData(options.queryKey), undefined);
  });

  for (const [status, attempts] of [
    [400, 1],
    [401, 1],
    [403, 1],
    [500, 2],
  ]) {
    test(`${query.name}: HTTP ${status} 응답은 최대 ${attempts}회 요청한다`, async (t) => {
      const client = createClient(t);
      const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
        Response.json({ message: '조회에 실패했습니다.' }, { status }),
      );

      await assert.rejects(
        query.fetch(client, query.options(client, { userId: 'user-a' })),
        (error) => error instanceof ApiError && error.status === status,
      );
      assert.equal(fetchMock.mock.callCount(), attempts);
    });
  }
}

test('사용자가 바뀌어도 이전 계정의 목록과 미읽음 개수 캐시를 재사용하지 않는다', async (t) => {
  const client = createClient(t);
  let currentUser = 'user-a';
  const fetchMock = t.mock.method(globalThis, 'fetch', async (url) =>
    Response.json(
      url.endsWith('unread-count')
        ? { count: currentUser === 'user-a' ? 2 : 7 }
        : { ...lastPage, items: [{ ...notification, id: currentUser }] },
    ),
  );

  for (const userId of ['user-a', 'user-b']) {
    currentUser = userId;
    client.setQueryData(authQueryKeys.me(), { account: { userId } });
    const list = await client.fetchInfiniteQuery(notificationListOptions(client, { userId }));
    const count = await client.fetchQuery(notificationUnreadCountOptions(client, { userId }));
    assert.equal(list.pages[0].items[0].id, userId);
    assert.equal(count.count, userId === 'user-a' ? 2 : 7);
  }
  assert.equal(fetchMock.mock.callCount(), 4);
  assert.equal(client.getQueryData(notificationQueryKeys.unreadCount('user-a')).count, 2);
  assert.equal(client.getQueryData(notificationQueryKeys.unreadCount('user-b')).count, 7);
});

test('페이지 크기가 다른 목록은 별도 캐시를 사용한다', async (t) => {
  const client = createClient(t);
  const limits = [];
  t.mock.method(globalThis, 'fetch', async (url) => {
    limits.push(new URL(url, 'http://localhost').searchParams.get('limit'));
    return Response.json(lastPage);
  });

  for (const limit of [20, 50, 20]) {
    await client.fetchInfiniteQuery(notificationListOptions(client, { userId: 'user-a', limit }));
  }
  assert.deepEqual(limits, ['20', '50']);
});

function QueryHarness({ onResult }) {
  const list = useNotifications();
  const count = useNotificationUnreadCount();
  onResult({ list, count });
  return null;
}

function readHooks(client) {
  let result;
  renderToStaticMarkup(
    createElement(
      QueryClientProvider,
      { client },
      createElement(QueryHarness, {
        onResult: (value) => {
          result = value;
        },
      }),
    ),
  );
  return result;
}

test('실제 조회 훅이 로그인 계정의 목록과 개수 캐시를 선택한다', (t) => {
  const client = createClient(t, 'user-b');
  for (const userId of ['user-a', 'user-b']) {
    client.setQueryData(notificationQueryKeys.list(userId, 20), {
      pages: [{ ...lastPage, items: [{ ...notification, id: userId }] }],
      pageParams: [undefined],
    });
    client.setQueryData(notificationQueryKeys.unreadCount(userId), {
      count: userId === 'user-a' ? 2 : 7,
    });
  }

  const { list, count } = readHooks(client);
  assert.equal(list.data.pages[0].items[0].id, 'user-b');
  assert.equal(count.data.count, 7);
});

test('인증 재조회 실패 후 캐시에 남은 사용자 정보로 알림을 노출하거나 요청하지 않는다', async (t) => {
  const client = createClient(t);
  client.setQueryData(notificationQueryKeys.list('user-a', 20), {
    pages: [firstPage],
    pageParams: [undefined],
  });
  client.setQueryData(notificationQueryKeys.unreadCount('user-a'), { count: 3 });
  await assert.rejects(
    client.fetchQuery({
      queryKey: authQueryKeys.me(),
      queryFn: async () => {
        throw new ApiError('인증이 만료되었습니다.', 401);
      },
      retry: false,
      staleTime: 0,
    }),
  );
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json(firstPage));
  const { list, count } = readHooks(client);

  assert.equal(list.data, undefined);
  assert.equal(count.data, undefined);
  await list.refetch();
  await count.refetch();
  assert.equal(fetchMock.mock.callCount(), 0);
});

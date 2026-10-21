import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  InfiniteQueryObserver,
  MutationObserver,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { ApiError } from '../src/api/client.ts';
import { authQueryKeys } from '../src/queries/auth/authQueryKeys.ts';
import { notificationQueryKeys as keys } from '../src/queries/notification/notificationQueryKeys.ts';
import {
  notificationListOptions,
  notificationUnreadCountOptions,
} from '../src/queries/notification/notificationQueryOptions.ts';
import { notificationMutationOptions } from '../src/queries/notification/notificationMutationOptions.ts';
import { useNotificationActions } from '../src/queries/notification/useNotificationActions.ts';

const item = {
  id: 'one',
  type: 'comment',
  message: '댓글 알림',
  isRead: false,
  createdAt: '2026-10-15T00:00:00Z',
  sender: null,
  target: null,
};
const seed = {
  pages: [
    { items: [item, { ...item, id: 'old-read', isRead: true }], nextCursor: 'next', hasMore: true },
    { items: [item, { ...item, id: 'two' }], nextCursor: null, hasMore: false },
  ],
  pageParams: [undefined, 'next'],
};
const actions = [
  { type: 'read', notificationId: 'one' },
  { type: 'readAll' },
  { type: 'delete', notificationId: 'one' },
];

function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function createClient(t) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { staleTime: Infinity, gcTime: Infinity, retry: false, retryDelay: 0 },
      mutations: { gcTime: Infinity },
    },
  });
  client.setQueryData(authQueryKeys.me(), { account: { userId: 'user-a' } });
  for (const [userId, limit] of [
    ['user-a', 20],
    ['user-a', 50],
    ['user-b', 20],
  ]) {
    client.setQueryData(keys.list(userId, limit), structuredClone(seed));
  }
  // 비활성 상태의 개수 캐시도 실제 조회 함수로 다시 동기화한다.
  client.setQueryDefaults(
    keys.unreadCount('user-a'),
    notificationUnreadCountOptions(client, { userId: 'user-a' }),
  );
  client.setQueryData(keys.unreadCount('user-a'), { count: 10 });
  client.setQueryData(keys.unreadCount('user-b'), { count: 99 });
  t.after(() => client.clear());
  return client;
}

function mockApi(t, handler) {
  return t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (String(url).includes('unread-count')) return Response.json({ count: 7 });
    return handler(url, options);
  });
}

function mutate(client, action) {
  return new MutationObserver(client, notificationMutationOptions(client, 'user-a')).mutate(action);
}

for (const action of actions) {
  test(`${action.type}: 성공 전에는 원본을 유지하고 모든 페이지·페이지 크기 캐시를 갱신한다`, async (t) => {
    const client = createClient(t);
    const gate = deferred();
    mockApi(t, async () => {
      await gate.promise;
      return Response.json(
        action.type === 'read' ? { id: 'one', isRead: true } : { success: true },
      );
    });
    const pending = mutate(client, action);
    await setImmediate();
    assert.deepEqual(client.getQueryData(keys.list('user-a', 20)), seed);
    gate.resolve();
    await pending;
    for (const limit of [20, 50]) {
      const data = client.getQueryData(keys.list('user-a', limit));
      assert.deepEqual(data.pageParams, seed.pageParams);
      assert.deepEqual(
        data.pages.map((p) => [p.hasMore, p.nextCursor]),
        [
          [true, 'next'],
          [false, null],
        ],
      );
      const items = data.pages.flatMap((p) => p.items);
      if (action.type === 'delete') {
        assert.equal(
          items.some((n) => n.id === 'one'),
          false,
        );
        assert.equal(items.find((n) => n.id === 'two').isRead, false);
      } else {
        assert.equal(
          items.filter((n) => n.id === 'one').every((n) => n.isRead),
          true,
        );
        assert.equal(items.find((n) => n.id === 'two').isRead, action.type === 'readAll');
      }
    }
    assert.deepEqual(client.getQueryData(keys.unreadCount('user-a')), { count: 7 });
    assert.deepEqual(client.getQueryData(keys.list('user-b', 20)), seed);
    assert.deepEqual(client.getQueryData(keys.unreadCount('user-b')), { count: 99 });
    assert.equal(client.getQueryState(keys.list('user-b', 20)).isInvalidated, false);
  });
}

for (const [action, body] of [
  [actions[0], { id: 'wrong', isRead: true }],
  [actions[0], { id: 'one', isRead: false }],
  [actions[1], { success: false }],
  [actions[2], { success: false }],
]) {
  test(`${action.type}: 잘못된 성공 응답 ${JSON.stringify(body)}를 성공으로 적용하지 않는다`, async (t) => {
    const client = createClient(t);
    mockApi(t, async () => Response.json(body));
    await assert.rejects(mutate(client, action));
    assert.deepEqual(client.getQueryData(keys.list('user-a', 20)), seed);
  });
}

for (const status of [400, 401, 403, 404, 500]) {
  test(`HTTP ${status}: 쓰기 요청을 자동 재시도하지 않고 목록을 임의로 변경하지 않는다`, async (t) => {
    const client = createClient(t);
    let writes = 0;
    mockApi(t, async () => {
      writes++;
      return Response.json({ message: '요청 실패' }, { status });
    });
    await assert.rejects(
      mutate(client, actions[2]),
      (error) => error instanceof ApiError && error.status === status,
    );
    assert.equal(writes, 1);
    assert.deepEqual(client.getQueryData(keys.list('user-a', 20)), seed);
  });
}

test('네트워크 실패 후 다음 시도는 정상 실행할 수 있다', async (t) => {
  const client = createClient(t);
  let fail = true;
  mockApi(t, async () => {
    if (fail) throw new TypeError('Failed to fetch');
    return Response.json({ id: 'one', isRead: true });
  });
  await assert.rejects(mutate(client, actions[0]), /Failed to fetch/);
  assert.deepEqual(client.getQueryData(keys.list('user-a', 20)), seed);
  fail = false;
  await mutate(client, actions[0]);
  assert.equal(client.getQueryData(keys.list('user-a', 20)).pages[0].items[0].isRead, true);
});

for (const transition of ['switch', 'logout', 'same-user-login']) {
  test(`${transition}: 지연된 쓰기 응답이 다른 로그인 세션의 캐시를 변경하지 않는다`, async (t) => {
    const client = createClient(t);
    const gate = deferred();
    const entered = deferred();
    const fetchMock = mockApi(t, async () => {
      entered.resolve();
      await gate.promise;
      return Response.json({ id: 'one', isRead: true });
    });
    const pending = mutate(client, actions[0]);
    const rejected = assert.rejects(
      pending,
      (error) => error instanceof ApiError && error.status === 401,
    );
    await entered.promise;
    if (transition === 'switch') {
      client.setQueryData(authQueryKeys.me(), { account: { userId: 'user-b' } });
    } else {
      client.clear();
      if (transition === 'same-user-login') {
        client.setQueryData(authQueryKeys.me(), { account: { userId: 'user-a' } });
        client.setQueryData(keys.list('user-a', 20), structuredClone(seed));
      }
    }
    gate.resolve();
    await rejected;
    assert.equal(fetchMock.mock.callCount(), 1);
    if (transition === 'logout') assert.equal(client.getQueryCache().getAll().length, 0);
    else {
      assert.deepEqual(client.getQueryData(keys.list('user-a', 20)), seed);
      assert.equal(client.getQueryState(keys.list('user-a', 20)).isInvalidated, false);
    }
  });
}

test('인증되지 않았거나 오래된 세션의 동작은 요청 전에 차단한다', async (t) => {
  const client = createClient(t);
  const oldOptions = notificationMutationOptions(client, 'user-a');
  client.clear();
  const fetchMock = mockApi(t, async () => Response.json({ success: true }));
  await assert.rejects(mutate(client, actions[1]), (error) => error.status === 401);
  client.setQueryData(authQueryKeys.me(), { account: { userId: 'user-a' } });
  await assert.rejects(
    new MutationObserver(client, oldOptions).mutate(actions[1]),
    (error) => error.status === 401,
  );
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('실제 훅은 연속 클릭과 다른 훅 인스턴스의 동시 쓰기를 차단한다', async (t) => {
  const client = createClient(t);
  const gate = deferred();
  const fetchMock = mockApi(t, async () => {
    await gate.promise;
    return Response.json({ id: 'one', isRead: true });
  });
  const hooks = [];
  function Capture() {
    hooks.push(useNotificationActions('user-a'));
    return null;
  }
  renderToStaticMarkup(
    createElement(QueryClientProvider, { client }, createElement(Capture), createElement(Capture)),
  );
  const first = hooks[0].execute(actions[0]);
  assert.equal(await hooks[0].execute(actions[0]), false);
  assert.equal(await hooks[1].execute(actions[2]), false);
  assert.equal(await hooks[1].execute(actions[1]), false);
  gate.resolve();
  assert.equal(await first, true);
  assert.equal(
    fetchMock.mock.calls.filter((call) => call.arguments[1]?.method === 'PATCH').length,
    1,
  );
  assert.equal(client.isMutating({ mutationKey: keys.actions('user-a') }), 0);
});

test('전체 읽음 후 활성 목록을 재조회해 서버에서 삭제한 오래된 읽음 알림과 커서를 반영한다', async (t) => {
  const client = createClient(t);
  const freshPage = {
    items: [
      { ...item, isRead: true },
      { ...item, id: 'two', isRead: true },
    ],
    nextCursor: null,
    hasMore: false,
  };
  mockApi(t, async (_url, options) =>
    Response.json(options.method === 'PATCH' ? { success: true } : freshPage),
  );
  const observer = new InfiniteQueryObserver(
    client,
    notificationListOptions(client, { userId: 'user-a' }),
  );
  const unsubscribe = observer.subscribe(() => {});
  t.after(unsubscribe);
  await mutate(client, actions[1]);
  assert.deepEqual(client.getQueryData(keys.list('user-a', 20)), {
    pages: [freshPage],
    pageParams: [undefined],
  });
});

test('쓰기 도중 시작한 조회의 늦은 응답이 성공 결과를 되돌리지 않는다', async (t) => {
  const client = createClient(t);
  const write = deferred();
  const read = deferred();
  const startedWrite = deferred();
  const startedRead = deferred();
  let readSignal;
  mockApi(t, async (_url, options) => {
    if (options.method === 'PATCH') {
      startedWrite.resolve();
      await write.promise;
      return Response.json({ id: 'one', isRead: true });
    }
    readSignal = options.signal;
    startedRead.resolve();
    await read.promise;
    return Response.json(seed.pages[0]);
  });
  const pending = mutate(client, actions[0]);
  await startedWrite.promise;
  const refetch = client.fetchInfiniteQuery({
    ...notificationListOptions(client, { userId: 'user-a' }),
    staleTime: 0,
  });
  await startedRead.promise;
  write.resolve();
  await pending;
  await refetch;
  assert.equal(readSignal.aborted, true);
  read.resolve();
  await setImmediate();
  assert.equal(client.getQueryData(keys.list('user-a', 20)).pages[0].items[0].isRead, true);
});

test('쓰기 성공 후 조회 실패를 쓰기 실패로 잘못 처리하지 않는다', async (t) => {
  const client = createClient(t);
  t.mock.method(globalThis, 'fetch', async (_url, options) =>
    options.method === 'PATCH'
      ? Response.json({ id: 'one', isRead: true })
      : Response.json({ message: '조회 실패' }, { status: 500 }),
  );
  const observer = new InfiniteQueryObserver(
    client,
    notificationListOptions(client, { userId: 'user-a' }),
  );
  const unsubscribe = observer.subscribe(() => {});
  t.after(unsubscribe);
  await mutate(client, actions[0]);
  assert.equal(client.getQueryData(keys.list('user-a', 20)).pages[0].items[0].isRead, true);
  assert.equal(observer.getCurrentResult().isRefetchError, true);
  assert.equal(client.getQueryState(keys.unreadCount('user-a')).status, 'error');
});

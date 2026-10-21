import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setImmediate } from 'node:timers/promises';
import {
  focusManager,
  InfiniteQueryObserver,
  MutationObserver,
  onlineManager,
  QueryClient,
  QueryObserver,
} from '@tanstack/react-query';

import { ApiError } from '../src/api/client.ts';
import { authQueryKeys } from '../src/queries/auth/authQueryKeys.ts';
import { notificationQueryKeys as keys } from '../src/queries/notification/notificationQueryKeys.ts';
import {
  NOTIFICATION_REFETCH_INTERVAL,
  notificationListOptions,
  notificationUnreadCountOptions,
} from '../src/queries/notification/notificationQueryOptions.ts';

const page = { items: [], nextCursor: null, hasMore: false };
const variants = [
  {
    name: '목록',
    options: notificationListOptions,
    Observer: InfiniteQueryObserver,
    response: page,
  },
  {
    name: '개수',
    options: notificationUnreadCountOptions,
    Observer: QueryObserver,
    response: { count: 2 },
  },
];
const idle = { state: { error: null, fetchStatus: 'idle' } };

function createClient(t, userId = 'user-a') {
  const client = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0, gcTime: Infinity } },
  });
  if (userId) client.setQueryData(authQueryKeys.me(), { account: { userId } });
  client.mount();
  t.after(() => {
    client.unmount();
    client.clear();
    focusManager.setFocused(undefined);
    onlineManager.setOnline(true);
  });
  return client;
}

for (const variant of variants) {
  test(`${variant.name}: 30초 간격, 백그라운드 중단, 탭 복귀·재연결·재열기 갱신 정책`, (t) => {
    const client = createClient(t);
    const options = variant.options(client, { userId: 'user-a' });
    assert.equal(NOTIFICATION_REFETCH_INTERVAL, 30_000);
    assert.equal(options.refetchInterval(idle), 30_000);
    assert.equal(options.staleTime, 30_000);
    assert.equal(options.refetchIntervalInBackground, false);
    assert.equal(options.retryOnMount, false);
    for (const event of ['refetchOnMount', 'refetchOnWindowFocus', 'refetchOnReconnect']) {
      assert.equal(options[event](idle), 'always');
    }
    for (const fetchStatus of ['fetching', 'paused']) {
      assert.equal(options.refetchInterval({ state: { error: null, fetchStatus } }), false);
    }
  });

  test(`${variant.name}: 자동 갱신만 중지해도 최초 조회와 명시적 재조회는 가능하다`, async (t) => {
    const client = createClient(t);
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      Response.json(variant.response),
    );
    const options = variant.options(client, { userId: 'user-a', autoRefresh: false });
    assert.equal(options.enabled, true);
    assert.equal(options.refetchInterval(idle), false);
    assert.equal(options.refetchOnWindowFocus(idle), false);
    const observer = new variant.Observer(client, options);
    const unsubscribe = observer.subscribe(() => {});
    t.after(unsubscribe);
    await setImmediate();
    assert.equal(fetchMock.mock.callCount(), 1);
    await observer.refetch();
    assert.equal(fetchMock.mock.callCount(), 2);
  });

  for (const status of [400, 401, 403, 404, 429]) {
    test(`${variant.name}: HTTP ${status} 후에는 자동 요청을 반복하지 않는다`, (t) => {
      const client = createClient(t);
      const options = variant.options(client, { userId: 'user-a' });
      const errorQuery = {
        state: { error: new ApiError('조회 실패', status), fetchStatus: 'idle' },
      };
      for (const event of [
        'refetchInterval',
        'refetchOnMount',
        'refetchOnWindowFocus',
        'refetchOnReconnect',
      ]) {
        assert.equal(options[event](errorQuery), false);
      }
    });
  }

  test(`${variant.name}: 일시적인 서버·네트워크 오류는 다음 주기에 회복할 수 있다`, (t) => {
    const client = createClient(t);
    const options = variant.options(client, { userId: 'user-a' });
    for (const error of [new ApiError('서버 오류', 503), new TypeError('Failed to fetch')]) {
      const query = { state: { error, fetchStatus: 'idle' } };
      assert.equal(options.refetchInterval(query), 30_000);
      assert.equal(options.refetchOnWindowFocus(query), 'always');
    }
  });

  test(`${variant.name}: 비로그인·비활성·계정 변경·인증 오류 상태에서는 자동 갱신하지 않는다`, async (t) => {
    const client = createClient(t, null);
    const options = variant.options(client, { userId: 'user-a' });
    assert.equal(options.refetchInterval(idle), false);
    client.setQueryData(authQueryKeys.me(), { account: { userId: 'user-a' } });
    assert.equal(
      variant.options(client, { userId: 'user-a', enabled: false }).refetchInterval(idle),
      false,
    );
    client.setQueryData(authQueryKeys.me(), { account: { userId: 'user-b' } });
    assert.equal(options.refetchOnWindowFocus(idle), false);
    client.setQueryData(authQueryKeys.me(), { account: { userId: 'user-a' } });
    await assert.rejects(
      client.fetchQuery({
        queryKey: authQueryKeys.me(),
        queryFn: async () => {
          throw new ApiError('인증 만료', 401);
        },
        retry: false,
        staleTime: 0,
      }),
    );
    assert.equal(options.refetchInterval(idle), false);
    assert.equal(options.refetchOnReconnect(idle), false);
  });

  test(`${variant.name}: 같은 사용자의 읽음·삭제 작업 중에만 자동 갱신을 멈춘다`, async (t) => {
    const client = createClient(t);
    const options = variant.options(client, { userId: 'user-a' });
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    const mutation = new MutationObserver(client, {
      mutationKey: keys.actions('user-a'),
      mutationFn: () => gate,
    });
    const pending = mutation.mutate();
    assert.equal(options.refetchInterval(idle), false);
    assert.equal(options.refetchOnWindowFocus(idle), false);
    release();
    await pending;
    assert.equal(options.refetchInterval(idle), 30_000);
    const otherMutation = new MutationObserver(client, {
      mutationKey: keys.actions('user-b'),
      mutationFn: async () => {},
    });
    const other = otherMutation.mutate();
    assert.equal(options.refetchInterval(idle), 30_000);
    await other;
  });

  test(`${variant.name}: 실제 옵저버가 탭 복귀와 재연결에 갱신하고 401 이후 중단한다`, async (t) => {
    const client = createClient(t);
    let status = 200;
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      status === 200
        ? Response.json(variant.response)
        : Response.json({ message: '인증 만료' }, { status }),
    );
    const observer = new variant.Observer(client, variant.options(client, { userId: 'user-a' }));
    const unsubscribe = observer.subscribe(() => {});
    t.after(unsubscribe);
    await setImmediate();
    assert.equal(fetchMock.mock.callCount(), 1);
    focusManager.setFocused(false);
    focusManager.setFocused(true);
    await setImmediate();
    assert.equal(fetchMock.mock.callCount(), 2);
    onlineManager.setOnline(false);
    onlineManager.setOnline(true);
    await setImmediate();
    assert.equal(fetchMock.mock.callCount(), 3);
    status = 401;
    focusManager.setFocused(false);
    focusManager.setFocused(true);
    await setImmediate();
    assert.equal(fetchMock.mock.callCount(), 4);
    assert.equal(observer.getCurrentResult().error.status, 401);
    focusManager.setFocused(false);
    focusManager.setFocused(true);
    onlineManager.setOnline(false);
    onlineManager.setOnline(true);
    await setImmediate();
    assert.equal(fetchMock.mock.callCount(), 4);
  });

  test(`${variant.name}: 401 캐시를 다시 열어도 요청을 반복하지 않고 수동 재조회로 회복한다`, async (t) => {
    const client = createClient(t);
    let status = 401;
    const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
      Response.json(status === 200 ? variant.response : { message: '인증 만료' }, { status }),
    );
    const options = variant.options(client, { userId: 'user-a' });
    const observer = new variant.Observer(client, options);
    const unsubscribe = observer.subscribe(() => {});
    await setImmediate();
    unsubscribe();
    const reopened = new variant.Observer(client, options);
    const stop = reopened.subscribe(() => {});
    t.after(stop);
    await setImmediate();
    assert.equal(fetchMock.mock.callCount(), 1);
    status = 200;
    await reopened.refetch();
    assert.equal(reopened.getCurrentResult().isSuccess, true);
    assert.equal(fetchMock.mock.callCount(), 2);
    assert.equal(options.refetchInterval(reopened.getCurrentQuery()), 30_000);
  });
}

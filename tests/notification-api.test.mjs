import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ApiError } from '../src/api/client.ts';
import {
  deleteNotification,
  getNotificationUnreadCount,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../src/api/notification.api.ts';

const notification = {
  id: 'notification-1',
  type: 'comment',
  message: '새 댓글이 등록되었습니다.',
  isRead: false,
  createdAt: '2026-10-15T00:00:00.000Z',
  sender: { id: 3, nickname: '치즈유저' },
  target: { type: 'info', id: 'post-1' },
};

const listResponse = { items: [notification], nextCursor: 'next-page', hasMore: true };
const mutationParams = { notificationId: notification.id, userId: 'must-not-be-sent' };

// Swagger의 notifications-inbox 계약: 쿠키 인증, 요청 본문 없음, 각기 다른 응답 형태.
const requests = [
  ['목록', () => getNotifications(), 'GET', '/notifications', listResponse],
  [
    '미읽음 개수',
    () => getNotificationUnreadCount(),
    'GET',
    '/notifications/unread-count',
    { count: 3 },
  ],
  [
    '개별 읽음',
    () => markNotificationAsRead(mutationParams),
    'PATCH',
    '/notifications/notification-1/read',
    { id: notification.id, isRead: true },
  ],
  [
    '전체 읽음',
    () => markAllNotificationsAsRead(),
    'PATCH',
    '/notifications/read-all',
    { success: true },
  ],
  [
    '삭제',
    () => deleteNotification(mutationParams),
    'DELETE',
    '/notifications/notification-1',
    { success: true },
  ],
];

for (const [name, call, method, path, response] of requests) {
  test(`${name}: 알림함 계약에 맞는 요청과 응답을 사용한다`, async (t) => {
    const fetchMock = t.mock.method(globalThis, 'fetch', async (url, options) => {
      assert.equal(url, `/backend-api${path}`);
      assert.equal(options.method, method);
      assert.equal(options.credentials, 'include');
      assert.equal(options.headers.get('Accept'), 'application/json');
      assert.equal(options.body, undefined);
      return Response.json(response);
    });

    assert.deepEqual(await call(), response);
    assert.equal(fetchMock.mock.callCount(), 1);
  });
}

test('다음 페이지 커서를 변형하지 않고 인코딩하며 사용자 ID를 보내지 않는다', async (t) => {
  const cursor = '2026-10-15T00:00:00Z+notification/1?value=a&b=2#end';
  t.mock.method(globalThis, 'fetch', async (url) => {
    const requestUrl = new URL(url, 'http://localhost');
    assert.equal(requestUrl.pathname, '/backend-api/notifications');
    assert.deepEqual(
      [...requestUrl.searchParams],
      [
        ['cursor', cursor],
        ['limit', '50'],
      ],
    );
    assert.equal(requestUrl.hash, '');
    return Response.json(listResponse);
  });

  assert.deepEqual(
    await getNotifications({ cursor, limit: 50, userId: 'must-not-be-sent' }),
    listResponse,
  );
});

test('첫 페이지는 null 커서와 미지정 limit을 쿼리에서 제외한다', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(url, '/backend-api/notifications');
    return Response.json({ items: [], nextCursor: null, hasMore: false });
  });

  assert.deepEqual(await getNotifications({ cursor: null }), {
    items: [],
    nextCursor: null,
    hasMore: false,
  });
});

test('발신자와 이동 대상이 없는 서비스 알림을 그대로 보존한다', async (t) => {
  const response = {
    items: [{ ...notification, type: 'serviceUpdate', sender: null, target: null }],
    nextCursor: null,
    hasMore: false,
  };
  t.mock.method(globalThis, 'fetch', async () => Response.json(response));

  assert.deepEqual(await getNotifications(), response);
});

for (const [name, call] of [
  ['목록', getNotifications],
  ['미읽음 개수', getNotificationUnreadCount],
]) {
  test(`${name}: 요청 취소 신호를 전달하고 HTTP 캐시를 사용하지 않는다`, async (t) => {
    const controller = new AbortController();
    const abortError = new DOMException('요청이 취소되었습니다.', 'AbortError');
    t.mock.method(globalThis, 'fetch', async (_url, options) => {
      assert.equal(options.signal, controller.signal);
      assert.equal(options.cache, 'no-store');
      return new Promise((_, reject) => {
        options.signal.addEventListener('abort', () => reject(abortError), { once: true });
      });
    });

    const pendingRequest = call({ signal: controller.signal });
    controller.abort();
    await assert.rejects(pendingRequest, (error) => error === abortError);
  });
}

test('읽음과 삭제 요청에서 알림 ID를 하나의 경로 요소로 인코딩한다', async (t) => {
  const notificationId = 'notification/1?other=2#end';
  const paths = [];
  t.mock.method(globalThis, 'fetch', async (url) => {
    paths.push(url);
    return Response.json({ id: notificationId, isRead: true, success: true });
  });

  await markNotificationAsRead({ notificationId });
  await deleteNotification({ notificationId });

  assert.deepEqual(paths, [
    '/backend-api/notifications/notification%2F1%3Fother%3D2%23end/read',
    '/backend-api/notifications/notification%2F1%3Fother%3D2%23end',
  ]);
});

for (const [name, call] of requests) {
  test(`${name}: 인증 만료를 정상 응답으로 처리하지 않는다`, async (t) => {
    t.mock.method(globalThis, 'fetch', async () =>
      Response.json({ message: '로그인이 필요합니다.' }, { status: 401 }),
    );

    await assert.rejects(
      call(),
      (error) =>
        error instanceof ApiError &&
        error.status === 401 &&
        error.message === '로그인이 필요합니다.',
    );
  });
}

test('삭제 실패의 상태 코드와 서버 오류 메시지를 유지한다', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ message: '알림을 찾을 수 없습니다.' }, { status: 404 }),
  );

  await assert.rejects(
    deleteNotification(mutationParams),
    (error) =>
      error instanceof ApiError &&
      error.status === 404 &&
      error.message === '알림을 찾을 수 없습니다.',
  );
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getNotificationTargetHref } from '../src/components/layout/sidebar/notification/notificationNavigation.ts';

for (const [type, route] of [
  ['job', 'jobs'],
  ['group', 'groups'],
  ['info', 'info'],
]) {
  test(`${type} 알림은 실제 커뮤니티 상세 경로로 이동한다`, () => {
    assert.equal(getNotificationTargetHref({ type, id: 'post-1' }), `/community/${route}/post-1`);
  });
}

test('타입이나 이동 대상이 없는 알림에는 임의의 링크를 만들지 않는다', () => {
  for (const target of [
    null,
    { type: 'unknown', id: '1' },
    { type: 'job', id: '' },
    { type: 'job', id: ' ' },
    { type: 'info', id: 3 },
  ]) {
    assert.equal(getNotificationTargetHref(target), null);
  }
});

test('서버 ID의 경로/쿼리/해시 문자를 하나의 경로 요소로 인코딩한다', () => {
  assert.equal(
    getNotificationTargetHref({ type: 'group', id: '1/2?x=a#b' }),
    '/community/groups/1%2F2%3Fx%3Da%23b',
  );
});

test('점 경로로 상세 페이지 밖으로 이동하지 않는다', () => {
  for (const id of ['.', '..']) assert.equal(getNotificationTargetHref({ type: 'job', id }), null);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  groupNotifications,
  toNotificationItem,
} from '../src/components/layout/sidebar/notification/notificationModel.ts';

const notification = {
  id: 'notification-1',
  type: 'comment',
  message: '작성자 님이 댓글을 남겼습니다.\n두 번째 줄입니다.',
  isRead: false,
  createdAt: '2026-10-14T16:00:00.000Z',
  sender: { id: 7, nickname: '작성자' },
  target: { type: 'info', id: 'post-1' },
};

test('서버 메시지와 연결 대상을 보존하고 없는 게시글 본문을 만들지 않는다', () => {
  const item = toNotificationItem(notification);
  assert.equal(item.message, notification.message);
  assert.deepEqual(item.sender, notification.sender);
  assert.deepEqual(item.target, notification.target);
  assert.equal(item.senderName, '작성자');
  assert.equal(item.category, '정보/자료공유');
  assert.equal('content' in item, false);
  assert.equal('href' in item, false);
});

test('자정 경계의 날짜를 한국 시간으로 표시한다', () => {
  const item = toNotificationItem(notification);
  assert.equal(item.dateLabel, '10월 15일');
  assert.equal(item.dateTime, notification.createdAt);
});

test('잘못된 날짜로 전체 목록 렌더링이 실패하지 않는다', () => {
  const item = toNotificationItem({ ...notification, createdAt: 'invalid' });
  assert.equal(item.dateLabel, '날짜 정보 없음');
  assert.equal(item.dateTime, undefined);
});

for (const [type, category, senderName] of [
  ['jobApply', '채용공고', '알림'],
  ['groupApply', '그룹모집', '알림'],
  ['comment', '댓글', '알림'],
  ['serviceUpdate', '업데이트', '치즈'],
]) {
  test(`${type}: 발신자와 대상이 null이면 알림 유형으로 표시한다`, () => {
    const item = toNotificationItem({ ...notification, type, sender: null, target: null });
    assert.equal(item.category, category);
    assert.equal(item.senderName, senderName);
    assert.equal(item.sender, null);
    assert.equal(item.target, null);
  });
}

test('공백인 발신자 이름은 기본 이름으로 표시한다', () => {
  const item = toNotificationItem({ ...notification, sender: { id: 7, nickname: '  ' } });
  assert.equal(item.senderName, '알림');
});

test('댓글은 실제 연결 대상에 맞는 카테고리를 표시한다', () => {
  for (const [type, label] of [
    ['job', '채용공고'],
    ['group', '그룹모집'],
    ['info', '정보/자료공유'],
  ]) {
    assert.equal(
      toNotificationItem({ ...notification, target: { type, id: 'post-1' } }).category,
      label,
    );
  }
});

test('여러 페이지에서 중복된 ID는 한 번만 표시하며 읽음 상태와 서버 순서를 보존한다', () => {
  const first = { ...notification, id: 'first', isRead: true };
  const second = { ...notification, id: 'second' };
  const third = { ...notification, id: 'third', isRead: true };
  const fourth = { ...notification, id: 'fourth' };
  const pages = [
    { items: [first, second], nextCursor: 'next', hasMore: true },
    {
      items: [{ ...first, isRead: false }, third, fourth, second],
      nextCursor: null,
      hasMore: false,
    },
  ];
  const original = structuredClone(pages);
  const result = groupNotifications(pages);

  assert.deepEqual(
    result.read.map((item) => item.id),
    ['first', 'third'],
  );
  assert.deepEqual(
    result.unread.map((item) => item.id),
    ['second', 'fourth'],
  );
  assert.deepEqual(pages, original);
});

test('아직 페이지가 없거나 빈 응답이면 두 그룹이 모두 비어 있다', () => {
  assert.deepEqual(groupNotifications([]), { unread: [], read: [] });
  assert.deepEqual(groupNotifications([{ items: [], nextCursor: null, hasMore: false }]), {
    unread: [],
    read: [],
  });
});

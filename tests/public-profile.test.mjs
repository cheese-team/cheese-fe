import assert from 'node:assert/strict';
import { test } from 'node:test';
import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { getPublicUserProfile } from '../src/api/profile.api.ts';
import { ApiError } from '../src/api/client.ts';
import { authQueryKeys } from '../src/queries/auth/authQueryKeys.ts';
import { publicProfileOptions } from '../src/queries/profile/publicProfileQueryOptions.ts';
import {
  getProfileWebHref,
  getPublicProfileContactHref,
  getPublicProfileFields,
} from '../src/components/common/PublicProfile/publicProfileModel.ts';

const personal = {
  profileType: 'personal',
  nickname: '치즈',
  profileImageUrl: null,
  email: 'user@example.com',
  contactMethod: 'email',
  contactUrl: '',
};
const company = { ...personal, profileType: 'company', companyName: '치즈기업' };

function setup(t, viewerId = 'viewer-a') {
  const client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } });
  client.setQueryData(authQueryKeys.me(), { account: { userId: viewerId } });
  t.after(() => client.clear());
  return client;
}

for (const profile of [personal, company]) {
  test(`${profile.profileType}: 공개 프로필 요청은 기존 쿠키 인증과 취소 신호를 사용한다`, async (t) => {
    const controller = new AbortController();
    t.mock.method(globalThis, 'fetch', async (url, options) => {
      assert.equal(url, '/backend-api/users/user%2F1%3Fq%3D2%23end/profile');
      assert.equal(options.credentials, 'include');
      assert.equal(options.method, 'GET');
      assert.equal(options.cache, 'no-store');
      assert.equal(options.signal, controller.signal);
      return Response.json(profile);
    });
    assert.deepEqual(
      await getPublicUserProfile({ userId: 'user/1?q=2#end', signal: controller.signal }),
      profile,
    );
  });
}

test('선택 상세 항목이 없는 개인/기업 프로필을 가짜 값으로 보완하지 않는다', () => {
  for (const profile of [personal, company])
    assert.ok(getPublicProfileFields(profile).every((field) => field.value === undefined));
  const fields = getPublicProfileFields({
    ...company,
    employeeCount: 0,
    industryType: ['IT', '교육'],
  });
  assert.equal(fields.find((field) => field.label === '사원 수').value, '0명');
  assert.equal(fields.find((field) => field.label === '산업 구분').value, 'IT, 교육');
});

test('연락처와 문서의 정상 웹 링크만 사용하며 비어 있으면 링크를 만들지 않는다', () => {
  for (const url of [
    '',
    null,
    undefined,
    'javascript:alert(1)',
    'data:text/html,test',
    '//evil.example.com',
  ])
    assert.equal(getProfileWebHref(url), null);
  assert.equal(getProfileWebHref('https://example.com/document'), 'https://example.com/document');
  assert.equal(getPublicProfileContactHref(personal), 'mailto:user%40example.com');
  assert.equal(getPublicProfileContactHref({ ...personal, email: '' }), null);
  assert.equal(
    getPublicProfileContactHref({
      ...personal,
      contactMethod: 'kakaoOpenChat',
      contactUrl: 'https://open.kakao.com/test',
    }),
    'https://open.kakao.com/test',
  );
  assert.equal(
    getPublicProfileContactHref({
      ...personal,
      contactMethod: 'googleForm',
      contactUrl: 'javascript:alert(1)',
    }),
    null,
  );
});

test('같은 발신자도 조회 계정별 캐시를 분리한다', async (t) => {
  const client = setup(t);
  const first = publicProfileOptions(client, { viewerId: 'viewer-a', userId: 'sender' });
  const second = publicProfileOptions(client, { viewerId: 'viewer-b', userId: 'sender' });
  assert.notDeepEqual(first.queryKey, second.queryKey);
  t.mock.method(globalThis, 'fetch', async () => Response.json(personal));
  assert.deepEqual(await client.fetchQuery(first), personal);
  assert.equal(client.getQueryData(second.queryKey), undefined);
});

for (const [contactMethod, contactUrl, expected] of [
  ['email', 'https://example.com/not-selected', 'mailto:user%40example.com'],
  ['kakaoOpenChat', 'https://open.kakao.com/o/contact', 'https://open.kakao.com/o/contact'],
  ['googleForm', 'https://forms.gle/contact', 'https://forms.gle/contact'],
]) {
  test(`알림 연락 버튼: 발신자가 지정한 ${contactMethod} 연락처를 사용한다`, async (t) => {
    const client = setup(t);
    t.mock.method(globalThis, 'fetch', async (url) => {
      assert.equal(url, '/backend-api/users/sender-id/profile');
      return Response.json({ ...personal, contactMethod, contactUrl });
    });
    const profile = await client.fetchQuery(
      publicProfileOptions(client, { viewerId: 'viewer-a', userId: 'sender-id' }),
    );
    assert.equal(getPublicProfileContactHref(profile), expected);
  });
}

test('선택한 외부 연락처가 누락되면 이메일로 임의 대체하지 않는다', () => {
  for (const contactMethod of ['kakaoOpenChat', 'googleForm']) {
    assert.equal(getPublicProfileContactHref({ ...personal, contactMethod, contactUrl: '' }), null);
  }
});

test('알 수 없는 연락 방식으로 외부 주소를 열지 않는다', () => {
  assert.equal(
    getPublicProfileContactHref({
      ...personal,
      contactMethod: 'unsupported',
      contactUrl: 'https://example.com',
    }),
    null,
  );
});

test('로그인/발신자 정보가 없거나 계정이 다르면 요청을 보내지 않는다', async (t) => {
  const client = setup(t);
  const mock = t.mock.method(globalThis, 'fetch', async () => Response.json(personal));
  for (const params of [
    { viewerId: '', userId: 'sender' },
    { viewerId: 'viewer-b', userId: 'sender' },
    { viewerId: 'viewer-a', userId: '' },
  ]) {
    const options = publicProfileOptions(client, params);
    assert.equal(options.enabled, false);
    await assert.rejects(client.fetchQuery(options), (error) => error.status === 401);
  }
  assert.equal(mock.mock.callCount(), 0);
});

for (const status of [401, 403, 404]) {
  test(`${status} 공개 프로필 오류를 자동 반복 요청하지 않는다`, async (t) => {
    const client = setup(t);
    const mock = t.mock.method(globalThis, 'fetch', async () =>
      Response.json({ message: '실패' }, { status }),
    );
    await assert.rejects(
      client.fetchQuery(publicProfileOptions(client, { viewerId: 'viewer-a', userId: 'sender' })),
      (error) => error instanceof ApiError && error.status === status,
    );
    assert.equal(mock.mock.callCount(), 1);
  });
}

test('일시적인 서버 오류는 한 번만 재시도한다', async (t) => {
  const client = setup(t);
  const mock = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ message: '실패' }, { status: 500 }),
  );
  await assert.rejects(
    client.fetchQuery(publicProfileOptions(client, { viewerId: 'viewer-a', userId: 'sender' })),
  );
  assert.equal(mock.mock.callCount(), 2);
});

for (const sameUser of [false, true]) {
  test(`${sameUser ? '동일 계정 재로그인' : '계정 전환'} 전 시작한 응답을 저장하지 않는다`, async (t) => {
    const client = setup(t);
    let resolve;
    t.mock.method(
      globalThis,
      'fetch',
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const options = publicProfileOptions(client, { viewerId: 'viewer-a', userId: 'sender' });
    const response = options.queryFn({ signal: new AbortController().signal });
    if (sameUser) client.clear();
    client.setQueryData(authQueryKeys.me(), {
      account: { userId: sameUser ? 'viewer-a' : 'viewer-b' },
    });
    resolve(Response.json(personal));
    await assert.rejects(response, (error) => error.status === 401);
    assert.equal(client.getQueryData(options.queryKey), undefined);
  });
}

test('프로필 모달 관찰자가 사라지면 진행 중인 요청을 취소한다', async (t) => {
  const client = setup(t);
  let signal;
  t.mock.method(globalThis, 'fetch', (_url, options) => {
    signal = options.signal;
    return new Promise((_, reject) =>
      signal.addEventListener('abort', () => reject(new DOMException('cancelled', 'AbortError'))),
    );
  });
  const observer = new QueryObserver(
    client,
    publicProfileOptions(client, { viewerId: 'viewer-a', userId: 'sender' }),
  );
  const unsubscribe = observer.subscribe(() => {});
  assert.equal(signal.aborted, false);
  unsubscribe();
  assert.equal(signal.aborted, true);
});

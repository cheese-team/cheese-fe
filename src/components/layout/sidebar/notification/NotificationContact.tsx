'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/client';
import { getPublicProfileContactHref } from '@/components/common/PublicProfile/publicProfileModel';
import { CONTACT_METHOD_OPTIONS } from '@/constants/profileOptions';
import { publicProfileOptions } from '@/queries/profile/publicProfileQueryOptions';

export function NotificationContact({
  viewerId,
  senderId,
  onRetryStart,
}: {
  viewerId: string;
  senderId: string;
  onRetryStart: () => void;
}) {
  const queryClient = useQueryClient();
  const profile = useQuery(publicProfileOptions(queryClient, { viewerId, userId: senderId }));

  if (profile.isPending) return <p role="status">연락 방법을 불러오는 중…</p>;
  if (profile.isError) {
    const status = profile.error instanceof ApiError ? profile.error.status : undefined;
    return (
      <div className="flex flex-col gap-2">
        <p role="alert">
          {status === 401
            ? '다시 로그인해 주세요.'
            : status === 403
              ? '연락처를 확인할 권한이 없습니다.'
              : status === 404
                ? '발신자를 찾을 수 없습니다.'
                : '연락 방법을 불러오지 못했습니다.'}
        </p>
        {status === 401 ? (
          <Link href="/login" className="underline">
            로그인하기
          </Link>
        ) : status !== 403 && status !== 404 ? (
          <button
            type="button"
            disabled={profile.isFetching}
            onClick={() => {
              onRetryStart();
              void profile.refetch();
            }}
            className="text-left underline disabled:opacity-50"
          >
            다시 시도
          </button>
        ) : null}
      </div>
    );
  }

  const href = getPublicProfileContactHref(profile.data);
  const label = CONTACT_METHOD_OPTIONS.find(
    (option) => option.value === profile.data.contactMethod,
  )?.label;
  if (!href || !label) return <p role="status">등록된 연락 방법이 없습니다.</p>;

  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium text-gray-950">{label}</p>
      <a
        href={href}
        target={profile.data.contactMethod === 'email' ? undefined : '_blank'}
        rel="noopener noreferrer"
        aria-label={`연락하기: ${label}`}
        className="focus-visible:outline-secondary-600 break-all text-gray-700 underline focus-visible:outline-2"
      >
        {profile.data.contactMethod === 'email' ? profile.data.email : profile.data.contactUrl}
      </a>
    </div>
  );
}

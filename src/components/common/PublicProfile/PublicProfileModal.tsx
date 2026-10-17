'use client';

import { useEffect, useId, useRef } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/client';
import CloseIcon from '@/assets/icons/common/close.svg';
import BaseModal from '@/components/common/Modal';
import ProfileImage from '@/components/common/ProfileImage';
import { CONTACT_METHOD_OPTIONS } from '@/constants/profileOptions';
import { publicProfileOptions } from '@/queries/profile/publicProfileQueryOptions';
import type { ProfileDocument } from '@/types/profile';
import {
  getProfileWebHref,
  getPublicProfileContactHref,
  getPublicProfileFields,
} from './publicProfileModel';

function ProfileDocuments({ document }: { document?: ProfileDocument | null }) {
  const fileHref = getProfileWebHref(document?.fileUrl);
  const urlHref = getProfileWebHref(document?.url);
  if (!fileHref && !urlHref) return <>미등록</>;
  return (
    <div className="flex flex-col gap-2">
      {fileHref ? (
        <a
          href={fileHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-success underline"
        >
          {document?.fileName || '첨부 파일'}
        </a>
      ) : null}
      {urlHref ? (
        <a
          href={urlHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-success underline"
        >
          {document?.urlLabel || (fileHref ? '관련 링크' : document?.fileName || '관련 링크')}
        </a>
      ) : null}
    </div>
  );
}

export function PublicProfileModal({
  viewerId,
  userId,
  trigger,
  onClose,
}: {
  viewerId: string;
  userId: string;
  trigger: HTMLButtonElement;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const profileQuery = useQuery(publicProfileOptions(queryClient, { viewerId, userId }));
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      const shouldRestore =
        document.activeElement === document.body || dialog?.contains(document.activeElement);
      if (shouldRestore)
        requestAnimationFrame(() => {
          if (trigger.isConnected && document.activeElement === document.body)
            trigger.focus({ preventScroll: true });
        });
    };
  }, [trigger]);

  const profile = profileQuery.isSuccess ? profileQuery.data : undefined;
  const name = profile
    ? (profile.profileType === 'personal' ? profile.nickname : profile.companyName)?.trim() ||
      '사용자'
    : '발신자';
  const contactHref = profile ? getPublicProfileContactHref(profile) : null;
  const status = profileQuery.error instanceof ApiError ? profileQuery.error.status : undefined;
  const errorMessage =
    status === 404
      ? '탈퇴했거나 찾을 수 없는 사용자입니다.'
      : status === 401
        ? '다시 로그인해 주세요.'
        : status === 403
          ? '이 프로필을 확인할 권한이 없습니다.'
          : '프로필을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';

  return (
    <BaseModal isOpen onClose={onClose} hasOverlay>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-bg-2 max-h-[85dvh] w-[min(760px,calc(100vw-40px))] overflow-y-auto rounded-[10px] p-6 sm:p-10"
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return;
          const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href]',
          );
          const first = focusable?.[0];
          const last = focusable?.[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-2xl font-bold break-all">
              {name} 님의 프로필
            </h2>
            {profile ? (
              <p className="mt-2 text-gray-600">
                {profile.profileType === 'personal' ? '개인 회원' : '기업 회원'}
              </p>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="프로필 닫기"
            className="focus-visible:outline-secondary-600 shrink-0 rounded p-2"
          >
            <CloseIcon className="h-5 w-5 text-gray-700" />
          </button>
        </header>
        {profileQuery.isPending ? (
          <p role="status" className="py-8 text-gray-600">
            프로필을 불러오는 중입니다…
          </p>
        ) : profileQuery.isError ? (
          <div className="flex flex-col items-start gap-4 py-8">
            <p role="alert">{errorMessage}</p>
            {status === 401 ? (
              <Link href="/login" onNavigate={onClose} className="underline">
                로그인하기
              </Link>
            ) : status !== 403 && status !== 404 ? (
              <button
                type="button"
                disabled={profileQuery.isFetching}
                onClick={() => {
                  // 재조회 중 재시도 버튼이 사라져도 포커스를 모달 안에 유지한다.
                  closeRef.current?.focus({ preventScroll: true });
                  void profileQuery.refetch();
                }}
                className="rounded border border-gray-300 px-4 py-2 disabled:opacity-50"
              >
                다시 시도
              </button>
            ) : null}
          </div>
        ) : profile ? (
          <div className="overflow-hidden rounded-[10px] bg-white">
            <div
              aria-hidden="true"
              className={`h-20 bg-linear-to-r ${profile.profileType === 'personal' ? 'from-[#B5D2F0] via-[#ECE8E9] to-[#FDF7E1]' : 'from-[#DBC0E4] via-[#DDD6D7] to-[#DFECCB]'}`}
            />
            <div className="flex flex-col gap-6 p-6">
              <div className="flex flex-wrap items-center gap-4">
                <ProfileImage src={profile.profileImageUrl} size={72} />
                <div className="min-w-0 flex-1 break-all">
                  <p className="text-xl font-bold">{name}</p>
                  <p className="mt-2 text-gray-600">{profile.email || '이메일 미등록'}</p>
                </div>
                {contactHref ? (
                  <a
                    href={contactHref}
                    target={profile.contactMethod === 'email' ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="bg-secondary-600 rounded-[10px] px-5 py-3 text-white"
                  >
                    연락하기
                  </a>
                ) : null}
              </div>
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {getPublicProfileFields(profile).map(({ label, value }) => (
                  <div key={label}>
                    <dt className="mb-2 font-medium text-gray-800">{label}</dt>
                    <dd className="min-h-11 rounded-[10px] border border-gray-300 px-4 py-2 break-words text-gray-700">
                      {value || '미등록'}
                    </dd>
                  </div>
                ))}
                <div>
                  <dt className="mb-2 font-medium text-gray-800">선호 연락 방법</dt>
                  <dd className="text-gray-700">
                    {CONTACT_METHOD_OPTIONS.find((option) => option.value === profile.contactMethod)
                      ?.label || '미등록'}
                  </dd>
                </div>
                {(profile.profileType === 'personal'
                  ? [
                      { label: '자기소개서', document: profile.coverLetter },
                      { label: '이력서 및 기타문서', document: profile.additionalDocument },
                    ]
                  : [{ label: '이력서 양식', document: profile.resumeTemplate }]
                ).map(({ label, document }) => (
                  <div key={label}>
                    <dt className="mb-2 font-medium text-gray-800">{label}</dt>
                    <dd className="break-all text-gray-700">
                      <ProfileDocuments document={document} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ) : null}
      </div>
    </BaseModal>
  );
}

'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import CommunityListState from '../CommunityListState';
import { Button } from '@/components/common/Button';
import { ApiError } from '@/api/client';
import { useComments } from '@/queries/community/useComments';
import { useCommentMutations } from '@/queries/community/useCommentMutations';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useMypage } from '@/queries/mypage/useMypage';
import type { CommunityCommentCategory, CommunityCommentResult } from '@/types/community/comment';

type CommentProps = { category: CommunityCommentCategory; postId: string };

export default function Comment({ category, postId }: CommentProps) {
  const {
    data,
    isPending,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useComments({ category, postId });
  const { create, update, remove } = useCommentMutations({ category, postId });
  const { data: user } = useCurrentUser();
  const { data: mypage } = useMypage(user?.id);
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [commentValue, setCommentValue] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const editingTextareaRef = useRef<HTMLTextAreaElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const busy = create.isPending || update.isPending || remove.isPending;
  const disabled = busy || !user;
  const comments = data?.pages.flatMap((page) => page.items) ?? [];
  const profile =
    user?.activeProfileType === 'company' ? mypage?.companyProfile : mypage?.personalProfile;

  useEffect(() => {
    if (editingCommentId) editingTextareaRef.current?.focus();
  }, [editingCommentId]);
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetchNextPageError) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isFetchingNextPage) void fetchNextPage();
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const onError = (error: Error) => {
    alert(error instanceof ApiError ? error.message : '댓글 요청에 실패했습니다.');
  };
  const submit = () => {
    const content = commentValue.trim();
    if (disabled || !content) return;
    create.mutate(
      { content },
      {
        onSuccess: () => {
          setCommentValue('');
        },
        onError,
      },
    );
  };
  const renderItem = (comment: CommunityCommentResult) => (
    <CommentItem
      key={comment.id}
      comment={comment}
      disabled={disabled}
      isMine={
        (comment.author.profileType === 'personal' &&
          comment.author.id === mypage?.personalProfile.id) ||
        (comment.author.profileType === 'company' &&
          comment.author.id === mypage?.companyProfile.id)
      }
      isEditing={editingCommentId === comment.id}
      isMenuOpen={openCommentId === comment.id}
      editingValue={editingValue}
      textareaRef={editingTextareaRef}
      onToggleMenu={(id) => setOpenCommentId((current) => (current === id ? null : id))}
      onStartEdit={(item) => {
        setEditingCommentId(item.id);
        setEditingValue(item.content);
        setOpenCommentId(null);
      }}
      onChangeEditingValue={setEditingValue}
      onUpdate={(commentId) => {
        if (disabled || !editingValue.trim()) return;
        update.mutate(
          { commentId, content: editingValue.trim() },
          {
            onSuccess: () => {
              setEditingCommentId(null);
              setEditingValue('');
            },
            onError,
          },
        );
      }}
      onCancelEdit={() => {
        setEditingCommentId(null);
        setEditingValue('');
      }}
      onDelete={(commentId) => {
        if (disabled) return;
        remove.mutate(commentId, {
          onSuccess: () => {
            setOpenCommentId(null);
          },
          onError,
        });
      }}
    />
  );

  return (
    <section className="text-[14px] leading-5">
      <CommentForm
        value={commentValue}
        onValueChange={setCommentValue}
        onSubmit={() => submit()}
        disabled={disabled}
        profileImageUrl={profile?.profileImageUrl}
      />
      {isPending && <CommunityListState type="loading" message="로딩 중..." />}
      {error && !isFetchNextPageError && (
        <CommunityListState
          type="error"
          message="댓글을 불러오지 못했습니다."
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      <ul className="mt-6 flex flex-col gap-4">
        {comments.map((comment) => (
          <Fragment key={comment.id}>
            {renderItem(comment)}
            {comment.replies.length > 0 && (
              <li className="ml-12 flex flex-col gap-4">
                <ul className="flex flex-col gap-4">{comment.replies.map(renderItem)}</ul>
              </li>
            )}
          </Fragment>
        ))}
      </ul>

      <div ref={loadMoreRef} className="h-px" />
      {isFetchingNextPage && <CommunityListState type="loading" message="로딩 중..." />}
      {isFetchNextPageError && (
        <Button
          disabled={isFetchingNextPage}
          onClick={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
        >
          다시 시도
        </Button>
      )}
    </section>
  );
}

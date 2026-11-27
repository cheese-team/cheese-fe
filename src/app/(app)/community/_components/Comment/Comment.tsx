'use client';

import { Fragment, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/common/Button';
import CommunityListState from '../CommunityListState';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import ReportModal from '../ReportModal';

import { ApiError } from '@/api/client';
import { useComments } from '@/queries/community/useComments';
import { useCommentMutations } from '@/queries/community/useCommentMutations';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useReportContent } from '../../_hooks/useReportContent';

import type { CommunityCommentCategory, CommunityCommentResult } from '@/types/community/comment';

type CommentProps = { category: CommunityCommentCategory; postId: string; postAuthorId: string };

export default function Comment({ category, postId, postAuthorId }: CommentProps) {
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
  const { reportTarget, openReportModal, closeReportModal, submitReport, isReportPending } =
    useReportContent();

  const [commentValue, setCommentValue] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyValue, setReplyValue] = useState('');

  const editingTextareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const busy = create.isPending || update.isPending || remove.isPending;

  const disabled = busy || !user;

  const comments = data?.pages.flatMap((page) => page.items) ?? [];
  const editingComment = comments
    .flatMap((comment) => [comment, ...comment.replies])
    .find((comment) => comment.id === editingCommentId);

  const profile = user?.profile;

  useEffect(() => {
    if (replyingCommentId) replyTextareaRef.current?.focus();
  }, [replyingCommentId]);

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

  const confirmInputChange = () => {
    const hasEditingChanges = !!editingComment && editingValue !== editingComment.content;
    const hasReplyChanges = replyingCommentId !== null && replyValue.length > 0;

    return (
      (!hasEditingChanges && !hasReplyChanges) ||
      window.confirm('작성 중인 내용이 사라집니다. 계속하시겠습니까?')
    );
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

  const submitReply = (parentId: string) => {
    const content = replyValue.trim();
    if (disabled || !content) return;

    create.mutate(
      { content, parentId },
      {
        onSuccess: () => {
          setReplyValue('');
          setReplyingCommentId(null);
        },
        onError,
      },
    );
  };

  const renderItem = (comment: CommunityCommentResult, hasReplies = false) => (
    <CommentItem
      key={comment.id}
      comment={comment}
      disabled={disabled}
      isReportPending={isReportPending}
      onReport={(commentId) => {
        if (disabled) return;
        openReportModal({
          targetType: 'comment',
          targetId: commentId,
          postId,
          authorId: comment.author.userId,
          authorName: comment.author.displayName,
          content: comment.content,
        });
      }}
      isMine={!!user && comment.author.userId === user.account.userId}
      isPostAuthor={comment.author.userId === postAuthorId}
      isEditing={editingCommentId === comment.id}
      editingValue={editingValue}
      textareaRef={editingTextareaRef}
      isReplying={replyingCommentId === comment.id}
      onReply={
        comment.parentId === null
          ? () => {
              if (disabled) return;
              if (replyingCommentId === comment.id) {
                if (!confirmInputChange()) return;
                setReplyingCommentId(null);
                setReplyValue('');
                return;
              }
              if (!confirmInputChange()) return;
              setEditingCommentId(null);
              setEditingValue('');
              setReplyValue('');
              setReplyingCommentId(comment.id);
            }
          : undefined
      }
      onStartEdit={(item) => {
        if (disabled || item.author.userId !== user?.account.userId) return;
        if (editingCommentId === item.id) {
          editingTextareaRef.current?.focus();
          return;
        }
        if (!confirmInputChange()) return;
        setReplyingCommentId(null);
        setReplyValue('');
        setEditingCommentId(item.id);
        setEditingValue(item.content);
      }}
      onChangeEditingValue={setEditingValue}
      onUpdate={(commentId) => {
        if (disabled || comment.author.userId !== user?.account.userId) return;

        const content = editingValue.trim();

        if (!content) {
          window.alert('댓글 내용을 입력하지 않았습니다');
          editingTextareaRef.current?.focus();
          return;
        }

        update.mutate(
          { commentId, content },
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
        if (!confirmInputChange()) return;

        setEditingCommentId(null);
        setEditingValue('');
      }}
      onDelete={(commentId) => {
        if (disabled || comment.author.userId !== user?.account.userId) return;
        if (
          hasReplies &&
          !window.confirm('댓글을 삭제하면 해당 댓글의 답글도 함께 사라집니다.\n삭제하시겠습니까?')
        )
          return;
        remove.mutate(commentId, {
          onSuccess: () => {
            if (editingCommentId === commentId || editingComment?.parentId === commentId) {
              setEditingCommentId(null);
              setEditingValue('');
            }
            if (replyingCommentId === commentId) {
              setReplyingCommentId(null);
              setReplyValue('');
            }
          },
          onError,
        });
      }}
    />
  );

  return (
    <section className="w-full min-w-0 text-[14px] leading-5">
      <CommentForm
        value={commentValue}
        onValueChange={setCommentValue}
        onSubmit={() => submit()}
        disabled={disabled}
        profileImageUrl={profile?.profileImageUrl}
        displayName={profile?.displayName}
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
            {renderItem(comment, comment.replies.length > 0)}

            {replyingCommentId === comment.id && (
              <li className="ml-12">
                <CommentForm
                  value={replyValue}
                  onValueChange={setReplyValue}
                  onSubmit={() => submitReply(comment.id)}
                  onCancel={() => {
                    if (!confirmInputChange()) return;
                    setReplyingCommentId(null);
                    setReplyValue('');
                  }}
                  isReply
                  textareaRef={replyTextareaRef}
                  disabled={disabled}
                  profileImageUrl={profile?.profileImageUrl}
                  displayName={profile?.displayName}
                />
              </li>
            )}

            {comment.replies.length > 0 && (
              <li className="ml-12 flex flex-col gap-4">
                <ul className="flex flex-col gap-4">
                  {comment.replies.map((reply) => renderItem(reply))}
                </ul>
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
      {reportTarget && (
        <ReportModal
          reportTarget={reportTarget}
          isPending={isReportPending}
          onClose={closeReportModal}
          onSubmit={(reason) => {
            void submitReport(reason);
          }}
        />
      )}
    </section>
  );
}

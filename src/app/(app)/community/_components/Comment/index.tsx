'use client';

import { useEffect, useRef, useState } from 'react';

import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

import { infoComments } from '@/mocks/posts';
import { getMockUserSummary } from '@/mocks/profile/userSummaries';
import { getMockPersonalProfile } from '@/mocks/profile/userProfiles';

export default function Comment() {
  const [openCommentId, setOpenCommentId] = useState<number | null>(null);

  const [commentList, setCommentList] = useState(infoComments);
  const [commentValue, setCommentValue] = useState('');

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const personalProfile = getMockPersonalProfile(1);

  const handleSubmitComment = () => {
    const trimmedComment = commentValue.trim();

    if (!trimmedComment) return;

    setCommentList((prev) => [
      ...prev,
      {
        id: Date.now(),
        // TODO: 현재 로그인한 프로필 모드(personal/company)에 따라 작성자 정보 설정
        author: getMockUserSummary(1, 'personal'),
        content: trimmedComment,
      },
    ]);

    setCommentValue('');
  };

  const handleUpdateComment = (commentId: number) => {
    const trimmedValue = editingValue.trim();

    if (!trimmedValue) return;

    setCommentList((prev) =>
      prev.map((item) => (item.id === commentId ? { ...item, content: trimmedValue } : item)),
    );

    setEditingCommentId(null);
    setEditingValue('');
  };

  const editingTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingCommentId !== null) {
      editingTextareaRef.current?.focus();
    }
  }, [editingCommentId]);

  return (
    <section className="text-[14px] leading-5">
      <CommentForm
        value={commentValue}
        onValueChange={setCommentValue}
        onSubmit={handleSubmitComment}
      />

      <ul className="mt-6 flex flex-col gap-4">
        {commentList.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isMine={comment.author.id === personalProfile.id}
            isEditing={editingCommentId === comment.id}
            isMenuOpen={openCommentId === comment.id}
            editingValue={editingValue}
            textareaRef={editingTextareaRef}
            onToggleMenu={(commentId) => {
              setOpenCommentId((prev) => (prev === commentId ? null : commentId));
            }}
            onStartEdit={(comment) => {
              setEditingCommentId(comment.id);
              setEditingValue(comment.content);
              setOpenCommentId(null);
            }}
            onChangeEditingValue={setEditingValue}
            onUpdate={handleUpdateComment}
            onCancelEdit={() => {
              setEditingCommentId(null);
              setEditingValue('');
            }}
            onDelete={(commentId) => {
              setCommentList((prev) => prev.filter((item) => item.id !== commentId));
              setOpenCommentId(null);
            }}
          />
        ))}
      </ul>
    </section>
  );
}

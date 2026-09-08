'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';

import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import CommunityEditorToolbar from './CommunityPostEditorToolbar';
import { ApiError } from '@/api/client';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useUploadFile } from '@/queries/files/useUploadFile';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

type CommunityPostEditorProps = {
  value: string;
  onChange: (value: string) => void;
  children?: ReactNode;
};

export default function CommunityPostEditor({
  value,
  onChange,
  children,
}: CommunityPostEditorProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const isUploadingRef = useRef(false);
  const { data: currentUser } = useCurrentUser();
  const { mutateAsync: uploadImage } = useUploadFile();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Image.configure({ allowBase64: false }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: '내용을 입력하세요',
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'memo-rich-editor min-h-[640px] w-full outline-none text-[16px] font-medium leading-[24px] text-gray-700',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  const openImagePicker = useCallback(() => {
    if (isUploadingRef.current) return;
    imageInputRef.current?.click();
  }, []);

  const handleUploadImages = useCallback(
    async (files: FileList | null) => {
      if (!files?.length || !editor || isUploadingRef.current) return;
      if (!currentUser) {
        alert('로그인 사용자 정보가 필요합니다.');
        return;
      }

      const imageFiles = Array.from(files);
      if (imageFiles.some((file) => !ACCEPTED_IMAGE_TYPES.has(file.type))) {
        alert('JPEG, PNG, GIF, WEBP 이미지만 업로드할 수 있습니다.');
        return;
      }
      if (imageFiles.some((file) => file.size > MAX_IMAGE_SIZE)) {
        alert('이미지는 파일당 최대 5MB까지 업로드할 수 있습니다.');
        return;
      }

      isUploadingRef.current = true;
      try {
        const results = await Promise.allSettled(
          imageFiles.map((file) => uploadImage({ userId: currentUser.id, file })),
        );
        const images = results.flatMap((result) => {
          if (result.status !== 'fulfilled') return [];
          const src = result.value.url;
          if (!src.trim() || /^\s*data:/i.test(src)) return [];
          return [{ type: 'image', attrs: { src } }];
        });

        if (editor.isDestroyed) return;
        if (images.length) editor.chain().focus().insertContent(images).run();

        if (images.length !== imageFiles.length) {
          const failure = results.find((result) => result.status === 'rejected');
          alert(
            failure?.status === 'rejected' && failure.reason instanceof ApiError
              ? failure.reason.message
              : '일부 이미지를 업로드하지 못했습니다. 다시 시도해주세요.',
          );
        }
      } finally {
        isUploadingRef.current = false;
      }
    },
    [editor, currentUser, uploadImage],
  );

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === value) return;

    editor.commands.setContent(value || '', {
      emitUpdate: false,
    });
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CommunityEditorToolbar editor={editor} onAddImage={openImagePicker} />

      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        className="hidden"
        onChange={(event) => {
          void handleUploadImages(event.target.files);
          event.target.value = '';
        }}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}

        <div>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

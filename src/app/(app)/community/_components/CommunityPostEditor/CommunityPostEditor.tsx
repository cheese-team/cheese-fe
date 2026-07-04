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

type CommunityPostEditorProps = {
  value: string;
  onChange: (value: string) => void;
  children?: ReactNode;
};

export function CommunityPostEditor({ value, onChange, children }: CommunityPostEditorProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);

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
      Image,
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
    imageInputRef.current?.click();
  }, []);

  const readImageAsDataUrl = (file: File) => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(String(reader.result));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleUploadImages = useCallback(
    async (files: FileList | null) => {
      if (!files || !editor) return;

      const imageFiles = Array.from(files);
      const imageSrcList = await Promise.all(imageFiles.map(readImageAsDataUrl));

      editor
        .chain()
        .focus()
        .insertContent(
          imageSrcList.map((src) => ({
            type: 'image',
            attrs: { src },
          })),
        )
        .run();
    },
    [editor],
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
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          handleUploadImages(event.target.files);
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

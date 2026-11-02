import { useState } from 'react';

type UseTagInputOptions = {
  initialTags?: string[];
  maxTags?: number;
  maxLength?: number;
};

export default function useTagInput({
  initialTags = [],
  maxTags,
  maxLength,
}: UseTagInputOptions = {}) {
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagError, setTagError] = useState('');

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '').trim();

    if (!tag) return;

    if (tags.some((value) => value.toLowerCase() === tag.toLowerCase())) {
      setTagError('이미 등록된 태그입니다.');
      return;
    }

    if (maxLength !== undefined && tag.length > maxLength) {
      setTagError(`태그는 최대 ${maxLength}자까지 입력할 수 있습니다.`);
      return;
    }

    if (maxTags !== undefined && tags.length >= maxTags) {
      setTagError(`태그는 최대 ${maxTags}개까지 등록할 수 있습니다.`);
      return;
    }

    setTags((prev) => [...prev, tag]);
    setTagInput('');
    setTagError('');
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((value) => value !== tag));
    setTagError('');
  };

  const handleTagInputChange = (value: string) => {
    const tag = value.trim().replace(/^#/, '').trim();

    if (maxLength !== undefined && tag.length > maxLength) {
      setTagError(`태그는 최대 ${maxLength}자까지 입력할 수 있습니다.`);
      return;
    }
    setTagError('');

    setTagInput(value);
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    addTag();
  };

  return {
    tagInput,
    tags,
    tagError,
    addTag,
    removeTag,
    handleTagKeyDown,
    handleTagInputChange,
  };
}

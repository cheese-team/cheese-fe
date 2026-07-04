import { useState } from 'react';

type UseTagInputOptions = {
  initialTags?: string[];

  maxTags?: number;
};

export default function useTagInput({ initialTags = [], maxTags }: UseTagInputOptions = {}) {
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialTags);

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '');

    if (!tag) return;
    if (tags.includes(tag)) return;

    if (maxTags !== undefined && tags.length >= maxTags) {
      return;
    }

    setTags((prev) => [...prev, tag]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((value) => value !== tag));
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    addTag();
  };

  return {
    tagInput,
    tags,
    setTagInput,
    addTag,
    removeTag,
    handleTagKeyDown,
  };
}

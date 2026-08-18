'use client';

import { useState } from 'react';

import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';

import { CommunityPostForm, FormField } from '../../_components/CommunityPostForm';

import {
  CAREER_OPTIONS,
  EDUCATION_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  FIELD_OPTIONS,
} from '@/constants/profileOptions';

import type { JobPost } from '@/types/community/community';
import { FieldSelectValue, toFieldArray, toFieldSelectValue } from '@/lib/jobField';

type JobPostFormProps = {
  mode: 'create' | 'edit';
  initialValues?: JobPost;
};

export default function JobPostForm({ mode, initialValues }: JobPostFormProps) {
  const [field, setField] = useState(toFieldSelectValue(initialValues?.field));
  const [employmentType, setEmploymentType] = useState(initialValues?.employmentType ?? '');
  const [education, setEducation] = useState(initialValues?.education ?? '');
  const [career, setCareer] = useState(initialValues?.career ?? '');
  const [date, setDate] = useState(initialValues?.deadline ?? '');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>, content: string) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const title = String(formData.get('title') ?? '');
    const location = String(formData.get('location') ?? '');
    const skills = String(formData.get('skills') ?? '')
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
    const applyUrl = String(formData.get('url') ?? '');

    const jobPostPayload = {
      title,
      field: toFieldArray(field),
      employmentType,
      location,
      education,
      career,
      skills,
      deadline: date,
      apply: {
        type: 'homepage',
        url: applyUrl,
      },
      content,
    };

    if (mode === 'create') {
      // TODO: 생성 API + 게시글 상세 페이지로 이동
      alert('게시글이 등록되었습니다.');
      return;
    }

    // TODO: 수정 API + 게시글 상세 페이지로 이동
    alert('게시글이 수정되었습니다.');
  };

  const applyUrl = initialValues?.apply.type === 'homepage' ? initialValues.apply.url : '';

  return (
    <CommunityPostForm
      mode={mode}
      onSubmit={handleSubmit}
      initialContent={initialValues?.content ?? ''}
    >
      <section className="flex flex-col gap-[30px]">
        <FormField label="제목" required>
          <Input
            label="제목"
            name="title"
            placeholder="제목 입력"
            defaultValue={initialValues?.title ?? ''}
            className="h-[30px]"
            inputClassName="font-medium"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-x-15 gap-y-6">
          <FormField label="모집분야" labelClassName="text-[14px]">
            <Select
              value={field}
              options={FIELD_OPTIONS}
              onChange={(value) => setField(value as FieldSelectValue)}
            />
          </FormField>

          <FormField label="고용 형태" labelClassName="text-[14px]">
            <Select
              value={employmentType}
              options={EMPLOYMENT_TYPE_OPTIONS}
              onChange={setEmploymentType}
            />
          </FormField>

          <FormField label="근무 지역" labelClassName="text-[14px]">
            <Input
              label="근무 지역"
              name="location"
              placeholder="근무 지역 입력"
              defaultValue={initialValues?.location ?? ''}
              className="h-[30px]"
              inputClassName="font-medium"
            />
          </FormField>

          <FormField label="학력" labelClassName="text-[14px]">
            <Select value={education} options={EDUCATION_OPTIONS} onChange={setEducation} />
          </FormField>

          <FormField label="경력" labelClassName="text-[14px]">
            <Select value={career} options={CAREER_OPTIONS} onChange={setCareer} />
          </FormField>

          <FormField label="필요스킬" labelClassName="text-[14px]">
            <Input
              label="필요스킬"
              name="skills"
              placeholder="예) React, TypeScript"
              defaultValue={initialValues?.skills?.join(', ') ?? ''}
              className="h-[30px]"
              inputClassName="font-medium"
            />
          </FormField>

          <FormField label="지원 마감일" labelClassName="text-[14px]">
            <DatePicker
              value={date}
              onChange={setDate}
              formatDisplayValue={(value) => value.replaceAll('-', '. ')}
              buttonClassName="border-b border-gray-400 h-[30px] focus-within:border-secondary-600 focus-within:border-b-2"
            />
          </FormField>

          <FormField label="공고 URL" labelClassName="text-[14px]" className="col-span-2" required>
            <Input
              label="공고 URL"
              name="url"
              type="url"
              placeholder="URL 입력"
              defaultValue={applyUrl}
              className="h-[30px]"
            />
          </FormField>
        </div>
      </section>
    </CommunityPostForm>
  );
}

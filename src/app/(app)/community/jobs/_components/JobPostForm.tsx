'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useCreateJobPost } from '@/queries/community/useCreateJobPost';
import { useUpdateJobPost } from '@/queries/community/useUpdateJobPost';
import { useMypage } from '@/queries/mypage/useMypage';
import { formatDate } from '@/lib/formatDate';

type JobPostFormProps = {
  mode: 'create' | 'edit';
  jobId?: string;
  initialValues?: JobPost;
};

// TODO: (논의필요) 채용공고 수정 진입 시 작성 프로필과 현재 활성 프로필을 비교하고,
// 불일치하면 프로필 전환 확인 후 수정 페이지로 이동하도록 처리
export default function JobPostForm({ mode, jobId, initialValues }: JobPostFormProps) {
  const router = useRouter();
  const [field, setField] = useState(toFieldSelectValue(initialValues?.field));
  const [employmentType, setEmploymentType] = useState(initialValues?.employmentType ?? '');
  const [education, setEducation] = useState(initialValues?.education ?? '');
  const [career, setCareer] = useState(initialValues?.career ?? '');
  const [date, setDate] = useState(
    initialValues?.deadline ? formatDate(initialValues.deadline).replaceAll('.', '-') : '',
  );

  const { data: user } = useCurrentUser();
  const { data: mypage } = useMypage(user?.id);
  const { mutate: createJobPost, isPending: isCreatePending } = useCreateJobPost();
  const { mutate: updateJobPost, isPending: isUpdatePending } = useUpdateJobPost();

  const isCompanyProfile = user?.activeProfileType === 'company';

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>, content: string) => {
    event.preventDefault();

    if (!user || isCreatePending || isUpdatePending) return;

    if (mode === 'create' && !mypage) return;

    const formData = new FormData(event.currentTarget);

    const title = String(formData.get('title') ?? '');
    const location = String(formData.get('location') ?? '');
    const skills = String(formData.get('skills') ?? '')
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
    const applyUrl = String(formData.get('url') ?? '').trim();

    if (!isCompanyProfile && !applyUrl) {
      return;
    }

    const jobPostData = {
      // TODO: 개인 프로필 작성 시 companyName 입력 방식 협의 필요
      companyName:
        mode === 'edit' && initialValues
          ? initialValues.companyName
          : isCompanyProfile
            ? (mypage?.companyProfile.companyName ?? '')
            : '',
      title,
      field: toFieldArray(field),
      employmentType,
      location,
      education,
      career,
      skills,
      deadline: date || null,
      apply: isCompanyProfile
        ? {
            type: 'direct' as const,
          }
        : {
            type: 'homepage' as const,
            url: applyUrl,
          },
      content,
    };

    if (mode === 'create') {
      createJobPost(
        { userId: user.id, ...jobPostData },
        {
          onSuccess: (createdJobPost) => {
            router.replace(`/community/jobs/${createdJobPost.id}`);
          },
        },
      );
      return;
    }

    if (!jobId || !initialValues) return;

    updateJobPost(
      {
        jobId,
        userId: user.id,
        data: jobPostData,
      },
      {
        onSuccess: () => {
          router.replace(`/community/jobs/${jobId}`);
        },
      },
    );
  };

  const applyUrl = initialValues?.apply.type === 'homepage' ? initialValues.apply.url : '';

  return (
    <CommunityPostForm
      mode={mode}
      onSubmit={handleSubmit}
      initialContent={initialValues?.content ?? ''}
      isSubmitting={mode === 'create' ? isCreatePending : isUpdatePending}
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
              formatDisplayValue={(value) => value.replaceAll('-', '.')}
              buttonClassName="border-b border-gray-400 h-[30px] focus-within:border-secondary-600 focus-within:border-b-2"
            />
          </FormField>

          {/* TODO: 기업 프로필에서 공고 URL 입력 시 직접지원과 외부 링크를 어떻게 제공할지 UX 협의 필요 */}
          <FormField label="공고 URL" labelClassName="text-[14px]" className="col-span-2">
            <Input
              label="공고 URL"
              name="url"
              type="url"
              required={!isCompanyProfile}
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

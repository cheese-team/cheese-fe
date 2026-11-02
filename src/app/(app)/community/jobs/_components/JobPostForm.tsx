'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';

import { CommunityPostForm, FormField } from '../../_components/CommunityPostForm';
import CommunityListState from '../../_components/CommunityListState';

import { ApiError } from '@/api/client';

import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useCreateJobPost } from '@/queries/community/useCreateJobPost';
import { useUpdateJobPost } from '@/queries/community/useUpdateJobPost';

import { toFieldArray, toFieldSelectValue, type FieldSelectValue } from '@/lib/jobField';
import { formatDate } from '@/lib/formatDate';
import { isHttpUrl } from '../_lib/isHttpUrl';

import {
  CAREER_OPTIONS,
  EDUCATION_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  FIELD_OPTIONS,
} from '@/constants/profileOptions';

import type { JobPost } from '@/types/community/community';
import type { CreateJobPostRequest } from '@/api/community.api';

const MAX_LENGTH = {
  title: 100,
  companyName: 20,
  location: 100,
  skills: 200,
  url: 2048,
} as const;

type JobPostFormProps = {
  mode: 'create' | 'edit';
  jobId?: string;
  initialValues?: Omit<JobPost, 'author'>;
};

type FormErrors = Partial<
  Record<'title' | 'companyName' | 'field' | 'location' | 'skills' | 'url' | 'deadline', string>
>;

export default function JobPostForm({ mode, jobId, initialValues }: JobPostFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const clearError = (name: keyof FormErrors) => {
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };
  const [field, setField] = useState(toFieldSelectValue(initialValues?.field));
  const [employmentType, setEmploymentType] = useState(initialValues?.employmentType ?? '');
  const [education, setEducation] = useState(initialValues?.education ?? '');
  const [career, setCareer] = useState(initialValues?.career ?? '');
  const initialDate = initialValues?.deadline
    ? formatDate(initialValues.deadline).replaceAll('.', '-')
    : '';
  const [date, setDate] = useState(initialDate);
  const today = formatDate(new Date().toISOString()).replaceAll('.', '-');
  const isOriginalDeadline = mode === 'edit' && date === initialDate;
  const minDate = isOriginalDeadline && date && date < today ? date : today;

  const handleDateChange = (nextDate: string) => {
    const currentToday = formatDate(new Date().toISOString()).replaceAll('.', '-');
    if (nextDate && nextDate < currentToday) return;
    setDate(nextDate);
    clearError('deadline');
  };

  const {
    data: user,
    isPending: isUserPending,
    error: userError,
    refetch: refetchUser,
  } = useCurrentUser();

  const { mutate: createJobPost, isPending: isCreatePending } = useCreateJobPost();
  const { mutate: updateJobPost, isPending: isUpdatePending } = useUpdateJobPost();

  const isCompanyProfile = user?.account.profileType === 'company';

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>, content: string) => {
    event.preventDefault();

    if (!user || isCreatePending || isUpdatePending) return;

    const formData = new FormData(event.currentTarget);

    const title = String(formData.get('title') ?? '').trim();

    const selectedFields = toFieldArray(field);
    const companyName = String(formData.get('companyName') ?? '').trim();

    const location = String(formData.get('location') ?? '');

    const skillsInput = String(formData.get('skills') ?? '').trim();

    const skills = skillsInput
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    const applyUrl = String(formData.get('url') ?? '').trim();

    const nextErrors: FormErrors = {};

    const currentToday = formatDate(new Date().toISOString()).replaceAll('.', '-');

    if (date && date < currentToday && !isOriginalDeadline) {
      nextErrors.deadline = '지원 마감일은 오늘 이후의 날짜로 선택해주세요.';
    }

    if (!title) {
      nextErrors.title = '제목을 입력해주세요.';
    } else if (title.length > MAX_LENGTH.title) {
      nextErrors.title = `제목은 최대 ${MAX_LENGTH.title}자까지 입력할 수 있습니다.`;
    }
    if (selectedFields.length === 0) nextErrors.field = '모집분야를 선택해주세요.';

    if (!companyName) {
      nextErrors.companyName = '회사명을 입력해주세요.';
    } else if (companyName.length > MAX_LENGTH.companyName) {
      nextErrors.companyName = `회사명은 최대 ${MAX_LENGTH.companyName}자까지 입력할 수 있습니다.`;
    }

    if (location.length > MAX_LENGTH.location) {
      nextErrors.location = `근무 지역은 최대 ${MAX_LENGTH.location}자까지 입력할 수 있습니다.`;
    }

    if (skillsInput.length > MAX_LENGTH.skills) {
      nextErrors.skills = `필요스킬은 최대 ${MAX_LENGTH.skills}자까지 입력할 수 있습니다.`;
    }

    if (applyUrl.length > MAX_LENGTH.url) {
      nextErrors.url = `공고 URL은 최대 ${MAX_LENGTH.url}자까지 입력할 수 있습니다.`;
    } else if (!isCompanyProfile && !applyUrl) {
      nextErrors.url = '공고 URL을 입력해주세요.';
    } else if (applyUrl && !isHttpUrl(applyUrl)) {
      nextErrors.url = 'http:// 또는 https://로 시작하는 URL을 입력해주세요.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const jobPostData: CreateJobPostRequest = {
      companyName,
      title,
      field: selectedFields,
      employmentType,
      location,
      education,
      career,
      skills,
      deadline: date || null,
      apply: isCompanyProfile
        ? {
            type: 'direct',
          }
        : {
            type: 'homepage',
            url: applyUrl,
          },
      content,
    };

    if (isCompanyProfile) {
      jobPostData.links = applyUrl ? [{ type: 'homepage', label: '공고 URL', url: applyUrl }] : [];
    }

    const onError = (error: Error) => {
      alert(error instanceof ApiError ? error.message : '채용공고 저장에 실패했습니다.');
    };

    if (mode === 'create') {
      createJobPost(jobPostData, {
        onSuccess: (createdJobPost) => {
          router.replace(`/community/jobs/${createdJobPost.id}`);
        },
        onError,
      });
      return;
    }

    if (!jobId || !initialValues) return;

    updateJobPost(
      {
        jobId,
        data: jobPostData,
      },
      {
        onSuccess: () => {
          router.replace(`/community/jobs/${jobId}`);
        },
        onError,
      },
    );
  };

  if (!user) {
    if (isUserPending) {
      return <CommunityListState type="loading" message="사용자 정보를 불러오는 중입니다." />;
    }
    return (
      <CommunityListState
        type="error"
        message={
          userError instanceof ApiError && userError.status === 401
            ? '로그인이 필요합니다. 다시 로그인해주세요.'
            : '사용자 정보를 불러오지 못했습니다.'
        }
        onRetry={() => {
          void refetchUser();
        }}
      />
    );
  }

  const homepageUrl = initialValues?.links?.find((link) => link.type === 'homepage')?.url ?? '';
  const applyUrl =
    !isCompanyProfile && initialValues?.apply.type === 'homepage'
      ? initialValues.apply.url
      : homepageUrl;

  return (
    <CommunityPostForm
      mode={mode}
      onSubmit={handleSubmit}
      initialContent={initialValues?.content ?? ''}
      isSubmitting={mode === 'create' ? isCreatePending : isUpdatePending}
      noValidate
    >
      <section className="flex flex-col gap-[30px]">
        <FormField label="제목" required>
          <Input
            label="제목"
            name="title"
            maxLength={MAX_LENGTH.title}
            errorMessage={errors.title}
            onChange={() => clearError('title')}
            required
            placeholder="제목 입력"
            defaultValue={initialValues?.title ?? ''}
            className="h-[30px]"
            inputClassName="font-medium"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-x-15 gap-y-6">
          <FormField label="회사명" required labelClassName="text-[14px]">
            <Input
              label="회사명"
              name="companyName"
              maxLength={MAX_LENGTH.companyName}
              errorMessage={errors.companyName}
              onChange={() => clearError('companyName')}
              required
              placeholder="회사명 입력"
              defaultValue={
                mode === 'edit'
                  ? (initialValues?.companyName ?? '')
                  : isCompanyProfile
                    ? user.profile.displayName
                    : ''
              }
              className="h-[30px]"
              inputClassName="font-medium"
            />
          </FormField>

          <FormField label="모집분야" required labelClassName="text-[14px]">
            <Select
              value={field}
              options={FIELD_OPTIONS}
              onChange={(value) => {
                setField(value as FieldSelectValue);
                clearError('field');
              }}
            />
            {errors.field && (
              <p role="alert" className="text-text-error text-xs font-medium tracking-[-0.04em]">
                {errors.field}
              </p>
            )}
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
              maxLength={MAX_LENGTH.location}
              errorMessage={errors.location}
              onChange={() => clearError('location')}
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
              maxLength={MAX_LENGTH.skills}
              errorMessage={errors.skills}
              onChange={() => clearError('skills')}
              placeholder="예) React, TypeScript"
              defaultValue={initialValues?.skills?.join(', ') ?? ''}
              className="h-[30px]"
              inputClassName="font-medium"
            />
          </FormField>

          <FormField label="지원 마감일" labelClassName="text-[14px]">
            <DatePicker
              label="지원 마감일"
              value={date}
              min={minDate}
              onChange={handleDateChange}
              formatDisplayValue={(value) => value.replaceAll('-', '.')}
              buttonClassName="border-b border-gray-400 h-[30px] focus-within:border-secondary-600 focus-within:border-b-2"
            />
            {errors.deadline && (
              <p role="alert" className="text-text-error text-xs font-medium tracking-[-0.04em]">
                {errors.deadline}
              </p>
            )}
          </FormField>

          <FormField
            label="공고 URL"
            required={!isCompanyProfile}
            labelClassName="text-[14px]"
            className="col-span-2"
          >
            <Input
              label="공고 URL"
              name="url"
              maxLength={MAX_LENGTH.url}
              type="url"
              required={!isCompanyProfile}
              errorMessage={errors.url}
              onChange={() => clearError('url')}
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

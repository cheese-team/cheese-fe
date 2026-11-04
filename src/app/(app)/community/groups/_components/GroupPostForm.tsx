'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';

import { CommunityPostForm, FormField } from '../../_components/CommunityPostForm';

import { ApiError } from '@/api/client';
import { useCreateGroupPost } from '@/queries/community/useCreateGroupPost';
import { useUpdateGroupPost } from '@/queries/community/useUpdateGroupPost';

import { formatDate } from '@/lib/formatDate';
import { toFieldArray, toFieldSelectValue, type FieldSelectValue } from '@/lib/jobField';

import { FIELD_OPTIONS, WORK_METHOD_OPTIONS } from '@/constants/profileOptions';

import type { GroupPost } from '@/types/community/community';
import type { CreateGroupPostRequest } from '@/api/community.api';

const MAX_LENGTH = {
  title: 100,
  expectedPeriod: 100,
  skills: 200,
} as const;

type FormErrors = Partial<
  Record<
    'title' | 'field' | 'progressType' | 'expectedPeriod' | 'skills' | 'recruitCount' | 'deadline',
    string
  >
>;

type GroupPostFormProps = {
  mode: 'create' | 'edit';
  groupId?: string;
  initialValues?: Omit<GroupPost, 'author'>;
};

export default function GroupPostForm({ mode, groupId, initialValues }: GroupPostFormProps) {
  const router = useRouter();

  const [errors, setErrors] = useState<FormErrors>({});
  const clearError = (name: keyof FormErrors) => {
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const [field, setField] = useState(toFieldSelectValue(initialValues?.field));
  const [progressType, setProgressType] = useState<CreateGroupPostRequest['progressType'] | ''>(
    initialValues?.progressType ?? '',
  );

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

  const { mutate: createGroupPost, isPending: isCreatePending } = useCreateGroupPost();
  const { mutate: updateGroupPost, isPending: isUpdatePending } = useUpdateGroupPost();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>, content: string) => {
    event.preventDefault();

    if (isCreatePending || isUpdatePending) return;

    const formData = new FormData(event.currentTarget);

    const title = String(formData.get('title') ?? '').trim();
    const selectedFields = toFieldArray(field);
    const expectedPeriod = String(formData.get('period') ?? '').trim();
    const skillsInput = String(formData.get('skills') ?? '').trim();

    const skills = skillsInput
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    const recruitCountInput = String(formData.get('recruitCount') ?? '').trim();
    const recruitCount = Number(recruitCountInput);

    const nextErrors: FormErrors = {};

    if (!title) {
      nextErrors.title = '제목을 입력해주세요.';
    } else if (title.length > MAX_LENGTH.title) {
      nextErrors.title = `제목은 최대 ${MAX_LENGTH.title}자까지 입력할 수 있습니다.`;
    }

    if (selectedFields.length === 0) {
      nextErrors.field = '모집분야를 선택해주세요.';
    }

    if (expectedPeriod.length > MAX_LENGTH.expectedPeriod) {
      nextErrors.expectedPeriod = `예상 기간은 최대 ${MAX_LENGTH.expectedPeriod}자까지 입력할 수 있습니다.`;
    }

    if (skillsInput.length > MAX_LENGTH.skills) {
      nextErrors.skills = `필요스킬은 최대 ${MAX_LENGTH.skills}자까지 입력할 수 있습니다.`;
    }

    if (!recruitCountInput) {
      nextErrors.recruitCount = '모집 인원을 입력해주세요.';
    } else if (!Number.isInteger(recruitCount) || recruitCount < 1) {
      nextErrors.recruitCount = '모집 인원은 1명 이상의 정수로 입력해주세요.';
    } else if (recruitCount > 999) {
      nextErrors.recruitCount = '모집 인원은 최대 999명까지 입력할 수 있습니다.';
    }

    const currentToday = formatDate(new Date().toISOString()).replaceAll('.', '-');
    if (date && date < currentToday && !isOriginalDeadline) {
      nextErrors.deadline = '지원 마감일은 오늘 이후의 날짜로 선택해주세요.';
    }

    if (progressType === '') {
      nextErrors.progressType = '진행방식을 선택해주세요.';
      setErrors(nextErrors);
      return;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const groupPostPayload: CreateGroupPostRequest = {
      title,
      field: selectedFields,
      progressType,
      expectedPeriod,
      skills,
      recruitCount,
      deadline: date || null,
      content,
    };

    const onError = (error: Error) => {
      alert(error instanceof ApiError ? error.message : '그룹모집 저장에 실패했습니다.');
    };

    if (mode === 'create') {
      createGroupPost(groupPostPayload, {
        onSuccess: (createdGroupPost) => {
          router.replace(`/community/groups/${createdGroupPost.id}`);
        },
        onError,
      });
      return;
    }

    if (!groupId || !initialValues) return;

    updateGroupPost(
      { groupId, data: groupPostPayload },
      {
        onSuccess: () => {
          router.replace(`/community/groups/${groupId}`);
        },
        onError,
      },
    );
  };

  return (
    <CommunityPostForm
      mode={mode}
      onSubmit={handleSubmit}
      initialContent={initialValues?.content ?? ''}
      isSubmitting={isCreatePending || isUpdatePending}
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
          <FormField label="모집분야" labelClassName="text-[14px]" required>
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

          <FormField label="진행방식" labelClassName="text-[14px]" required>
            <Select
              value={progressType}
              options={WORK_METHOD_OPTIONS}
              onChange={(value) => {
                if (value === 'online' || value === 'offline' || value === 'online/offline') {
                  setProgressType(value);
                  clearError('progressType');
                }
              }}
            />
            {errors.progressType && (
              <p role="alert" className="text-text-error text-xs font-medium tracking-[-0.04em]">
                {errors.progressType}
              </p>
            )}
          </FormField>

          <FormField label="예상 기간" labelClassName="text-[14px]">
            <Input
              label="예상 기간"
              name="period"
              maxLength={MAX_LENGTH.expectedPeriod}
              errorMessage={errors.expectedPeriod}
              onChange={() => clearError('expectedPeriod')}
              placeholder="예상 기간 입력"
              defaultValue={initialValues?.expectedPeriod ?? ''}
              className="h-[30px]"
              inputClassName="font-medium"
            />
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

          <FormField label="모집 인원" labelClassName="text-[14px]" required>
            <Input
              label="모집 인원"
              name="recruitCount"
              type="number"
              min={1}
              max={999}
              step={1}
              required
              errorMessage={errors.recruitCount}
              onChange={() => clearError('recruitCount')}
              placeholder="모집 인원 입력"
              defaultValue={initialValues?.recruitCount ?? ''}
              className="h-[30px]"
              inputClassName="font-medium"
            />
          </FormField>

          <FormField label="지원 마감일" labelClassName="text-[14px]">
            <DatePicker
              label="지원 마감일"
              value={date}
              min={minDate}
              formatDisplayValue={(value) => value.replaceAll('-', '.')}
              onChange={handleDateChange}
              buttonClassName="border-b border-gray-400 h-[30px] focus-within:border-secondary-600 focus-within:border-b-2"
            />
            {errors.deadline && (
              <p role="alert" className="text-text-error text-xs font-medium tracking-[-0.04em]">
                {errors.deadline}
              </p>
            )}
          </FormField>
        </div>
      </section>
    </CommunityPostForm>
  );
}

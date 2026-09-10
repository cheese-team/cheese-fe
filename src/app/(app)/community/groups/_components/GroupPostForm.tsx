'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import DatePicker from '@/components/common/DatePicker/DatePicker';

import { CommunityPostForm, FormField } from '../../_components/CommunityPostForm';

import { toFieldArray, toFieldSelectValue, type FieldSelectValue } from '@/lib/jobField';
import { FIELD_OPTIONS, WORK_METHOD_OPTIONS } from '@/constants/profileOptions';

import type { GroupPost } from '@/types/community/community';
import type { CreateGroupPostRequest } from '@/api/community.api';
import { ApiError } from '@/api/client';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useCreateGroupPost } from '@/queries/community/useCreateGroupPost';
import { useUpdateGroupPost } from '@/queries/community/useUpdateGroupPost';
import { formatDate } from '@/lib/formatDate';

type GroupPostFormProps = {
  mode: 'create' | 'edit';
  groupId?: string;
  initialValues?: GroupPost;
};

export default function GroupPostForm({ mode, groupId, initialValues }: GroupPostFormProps) {
  const router = useRouter();
  const [field, setField] = useState(toFieldSelectValue(initialValues?.field));
  const [progressType, setProgressType] = useState(initialValues?.progressType ?? '');

  const [date, setDate] = useState(
    initialValues?.deadline ? formatDate(initialValues.deadline).replaceAll('.', '-') : '',
  );
  const { data: user } = useCurrentUser();
  const { mutate: createGroupPost, isPending: isCreatePending } = useCreateGroupPost();
  const { mutate: updateGroupPost, isPending: isUpdatePending } = useUpdateGroupPost();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>, content: string) => {
    event.preventDefault();

    if (!user || isCreatePending || isUpdatePending) return;

    const selectedFields = toFieldArray(field);

    if (selectedFields.length === 0) {
      alert('모집분야를 선택해주세요.');
      return;
    }

    if (
      progressType !== 'online' &&
      progressType !== 'offline' &&
      progressType !== 'online/offline'
    ) {
      alert('진행방식을 선택해주세요.');
      return;
    }

    const formData = new FormData(event.currentTarget);

    const title = String(formData.get('title') ?? '');
    const expectedPeriod = String(formData.get('period') ?? '');
    const skills = String(formData.get('skills') ?? '')
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
    const recruitCount = Number(formData.get('recruitCount') ?? 0);

    const groupPostPayload: Omit<CreateGroupPostRequest, 'userId'> = {
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
      createGroupPost(
        { userId: user.id, ...groupPostPayload },
        {
          onSuccess: (createdGroupPost) => {
            router.replace(`/community/groups/${createdGroupPost.id}`);
          },
          onError,
        },
      );
      return;
    }

    if (!groupId || !initialValues) return;

    updateGroupPost(
      { groupId, userId: user.id, data: groupPostPayload },
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
    >
      <section className="flex flex-col gap-[30px]">
        <FormField label="제목" required>
          <Input
            label="제목"
            name="title"
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
              onChange={(value) => setField(value as FieldSelectValue)}
            />
          </FormField>

          <FormField label="진행방식" labelClassName="text-[14px]" required>
            <Select value={progressType} options={WORK_METHOD_OPTIONS} onChange={setProgressType} />
          </FormField>

          <FormField label="예상 기간" labelClassName="text-[14px]">
            <Input
              label="예상 기간"
              name="period"
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
              required
              placeholder="모집 인원 입력"
              defaultValue={initialValues?.recruitCount ?? ''}
              className="h-[30px]"
              inputClassName="font-medium"
            />
          </FormField>

          <FormField label="지원 마감일" labelClassName="text-[14px]">
            <DatePicker
              value={date}
              formatDisplayValue={(value) => value.replaceAll('-', '.')}
              onChange={setDate}
              buttonClassName="border-b border-gray-400 h-[30px] focus-within:border-secondary-600 focus-within:border-b-2"
            />
          </FormField>
        </div>
      </section>
    </CommunityPostForm>
  );
}

'use client';

import { useState } from 'react';
import { Input, InputActionButton } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Checkbox } from '@/components/common/Checkbox';
import Chevron from '@/assets/icons/common/chevron.svg';
import TermsModal from './_components/TermsModal';
import EmailVerifyModal from '../_components/EmailVerifyModal';

export default function SignupPage() {
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const openVerify = () => setIsVerifyOpen(true);
  const closeVerify = () => setIsVerifyOpen(false);

  const openTerms = () => setIsTermsOpen(true);
  const closeTerms = () => setIsTermsOpen(false);

  return (
    <div className="flex flex-col gap-10">
      <h2 className="text-[20px] font-bold">회원가입</h2>

      <form className="flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          <Input
            label="닉네임"
            placeholder="닉네임 입력"
            type="text"
            name="nickname"
            rightAddon={<InputActionButton>중복확인</InputActionButton>}
            errorMessage={'중복된 닉네임이 있습니다'}
            successMessage={'사용가능한 닉네임 입니다'}
          />
          <Input
            label="아이디"
            placeholder="아이디 (이메일) 입력"
            type="email"
            name="email"
            readOnly
            rightAddon={<InputActionButton onClick={openVerify}>입력하기</InputActionButton>}
            successMessage={'사용가능'}
          />
          <Input
            label="비밀번호"
            placeholder="비밀번호 입력"
            type="password"
            name="password"
            errorMessage={'영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다'}
          />
          <Input
            label="비밀번호 확인"
            placeholder="비밀번호 재입력"
            type="password"
            name="passwordConfirm"
            errorMessage="비밀번호가 일치하지 않습니다"
            successMessage={'비밀번호가 일치합니다.'}
          />

          <div
            role="button"
            tabIndex={0}
            onClick={openTerms}
            className="flex w-full cursor-pointer items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                <Checkbox name="terms" required />
              </div>
              <span className="text-sm">치즈 이용약관 동의</span>
            </div>

            <div className="flex h-5 w-5 items-center justify-center">
              <Chevron width={6} height={10} />
            </div>
          </div>
        </div>

        <Button type="submit">회원가입</Button>
      </form>

      <EmailVerifyModal title="아이디 (이메일) 입력" isOpen={isVerifyOpen} onClose={closeVerify} />
      <TermsModal isOpen={isTermsOpen} onClose={closeTerms} />
    </div>
  );
}

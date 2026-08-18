'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

import { AUTH_MESSAGE } from '@/constants/auth';

import SeparatorIcon from '@/assets/icons/common/separator-vertival.svg';

export default function LoginPage() {
  const [loginError, setLoginError] = useState<string>();

  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(undefined);

    const formData = new FormData(event.currentTarget);

    const loginData = {
      email: String(formData.get('email') ?? '').trim(),
      password: String(formData.get('password') ?? ''),
    };

    try {
      // TODO: 로그인 API 호출
      router.push('/dashboard');
    } catch {
      setLoginError(AUTH_MESSAGE.LOGIN.INVALID);
    }
  };

  return (
    <div>
      <form
        className="flex flex-col gap-5 pb-10"
        onSubmit={handleSubmit}
        onChange={() => setLoginError(undefined)}
      >
        <div className="flex flex-col gap-5">
          <Input
            label="아이디"
            name="email"
            type="email"
            placeholder="아이디"
            className="h-10 px-2 font-medium tracking-normal"
            showMessageSpace
          />
          <Input
            label="비밀번호"
            name="password"
            type="password"
            placeholder="비밀번호"
            errorMessage={loginError}
            className="h-10 px-2 font-medium tracking-normal"
            showMessageSpace
          />
        </div>

        <Button variant="light" type="submit" className="text-[16px]">
          로그인
        </Button>

        <div className="flex items-center justify-evenly font-medium tracking-normal text-gray-700">
          <Link className="flex-1 text-center" href="/signup">
            회원가입
          </Link>
          <SeparatorIcon className="h-[13px] text-gray-500" />
          <Link className="flex-1 text-center" href="/reset-password">
            비밀번호 재설정
          </Link>
        </div>
      </form>

      <section>
        <div className="flex items-center gap-4 pb-8">
          <div className="h-px flex-1 bg-gray-400" aria-hidden="true" />
          <span className="font-medium tracking-normal text-gray-500">간편로그인</span>
          <div className="h-px flex-1 bg-gray-400" aria-hidden="true" />
        </div>

        <div className="flex justify-center gap-[45px]">
          <Button variant="circle" aria-label="구글 로그인">
            <Image src="/brands/google.svg" width={19} height={20} alt="" />
          </Button>
          <Button variant="circle" className="bg-primary-700" aria-label="카카오 로그인">
            <Image src="/brands/kakao.svg" width={22} height={20} alt="" />
          </Button>
        </div>
      </section>
    </div>
  );
}

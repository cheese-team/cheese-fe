import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export default function LoginPage() {
  return (
    <div>
      <form className="flex flex-col gap-5 pb-10">
        <div className="flex flex-col gap-5">
          <Input label="아이디" placeholder="아이디" type="email" name="email" />
          <Input
            label="비밀번호"
            placeholder="비밀번호"
            type="password"
            name="password"
            errorMessage="아이디 또는 비밀번호가 일치하지 않습니다"
          />
        </div>

        <Button type="submit">로그인</Button>

        <div className="flex justify-evenly text-gray-600">
          <Link href="/signup">회원가입</Link>
          <span>|</span>
          <Link href="/reset-password">비밀번호 재설정</Link>
        </div>
      </form>

      <section>
        <div className="flex items-center gap-4 pb-8">
          <div className="h-px flex-1 bg-gray-400" />
          <span className="text-text-muted whitespace-nowrap">간편로그인</span>
          <div className="h-px flex-1 bg-gray-400" />
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

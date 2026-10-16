'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Input, InputActionButton } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

import TermsModal from './_components/TermsModal';
import EmailVerifyModal from '../_components/EmailVerifyModal';
import AuthConfirmModal from '../../_components/AuthConfirmModal';

import { useSignup } from '@/queries/auth/useSignup';
import { useCheckNickname } from '@/queries/auth/useCheckNickname';
import { ApiError } from '@/api/client';

import { AUTH_MESSAGE } from '../_constants/authMessage';
import {
  validateNickname,
  validatePassword,
  validatePasswordConfirmation,
} from '../_lib/validation';

import CheckIcon from '@/assets/icons/common/check.svg';
import ChevronIcon from '@/assets/icons/common/chevron.svg';

import type { SignupRequest } from '@/api/auth.api';
import type { ProfileType } from '@/types/profile';

type NicknameStatus = 'idle' | 'checking' | 'available' | 'duplicated';

type SignupErrors = {
  profileType?: string;
  companyName?: string;
  nickname?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
};

export default function SignupPage() {
  const router = useRouter();

  const [profileType, setProfileType] = useState<ProfileType>();
  const [companyName, setCompanyName] = useState('');
  const [nickname, setNickname] = useState('');
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>('idle');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [signupErrors, setSignupErrors] = useState<SignupErrors>({});

  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isDoneOpen, setIsDoneOpen] = useState(false);

  const nicknameRef = useRef<HTMLInputElement>(null);
  const profileTypeRef = useRef<HTMLInputElement>(null);
  const companyNameRef = useRef<HTMLInputElement>(null);
  const nicknameRequestIdRef = useRef(0);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmationRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: signup, isPending: isSignupPending } = useSignup();
  const { mutateAsync: checkNickname } = useCheckNickname();

  const isPasswordMatched =
    Boolean(passwordConfirmation) &&
    !validatePassword(password) &&
    !validatePasswordConfirmation(password, passwordConfirmation);

  const openVerify = () => setIsVerifyOpen(true);
  const closeVerify = () => setIsVerifyOpen(false);

  const openTerms = () => setIsTermsOpen(true);
  const closeTerms = () => setIsTermsOpen(false);

  const handleProfileTypeChange = (value: ProfileType) => {
    nicknameRequestIdRef.current += 1;

    setProfileType(value);
    setNickname('');
    setCompanyName('');
    setNicknameStatus('idle');

    setSignupErrors((prev) => ({
      ...prev,
      profileType: undefined,
      nickname: undefined,
      companyName: undefined,
    }));
  };

  const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    nicknameRequestIdRef.current += 1;
    setNickname(event.target.value);
    setNicknameStatus('idle');

    setSignupErrors((prev) => ({
      ...prev,
      nickname: undefined,
    }));
  };

  const handleEmailVerified = (email: string) => {
    setVerifiedEmail(email);

    setSignupErrors((prev) => ({
      ...prev,
      email: undefined,
    }));
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);

    setSignupErrors((prev) => ({
      ...prev,
      password: undefined,
      passwordConfirmation: undefined,
    }));
  };

  const handlePasswordConfirmationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirmation(event.target.value);

    setSignupErrors((prev) => ({
      ...prev,
      passwordConfirmation: undefined,
    }));
  };

  const handleCheckNickname = async () => {
    if (profileType !== 'personal' || nicknameStatus === 'checking') return;

    const normalizedNickname = nickname.trim();
    const nicknameError = validateNickname(normalizedNickname);

    if (nicknameError) {
      setSignupErrors((prev) => ({
        ...prev,
        nickname: nicknameError,
      }));
      return;
    }

    const requestId = ++nicknameRequestIdRef.current;
    setNicknameStatus('checking');

    try {
      const checkNicknameResult = await checkNickname(normalizedNickname);

      if (requestId !== nicknameRequestIdRef.current) return;

      setNicknameStatus(checkNicknameResult.available ? 'available' : 'duplicated');

      setSignupErrors((prev) => ({
        ...prev,
        nickname: checkNicknameResult.available ? undefined : AUTH_MESSAGE.NICKNAME.DUPLICATED,
      }));
    } catch {
      if (requestId !== nicknameRequestIdRef.current) return;

      setNicknameStatus('idle');

      setSignupErrors((prev) => ({
        ...prev,
        nickname: AUTH_MESSAGE.NICKNAME.FAILED,
      }));
    }
  };

  const getNicknameError = () => {
    const validationError = validateNickname(nickname);

    if (validationError) {
      return validationError;
    }

    if (nicknameStatus === 'duplicated') {
      return AUTH_MESSAGE.NICKNAME.DUPLICATED;
    }

    if (nicknameStatus !== 'available') {
      return AUTH_MESSAGE.NICKNAME.CHECK_REQUIRED;
    }

    return undefined;
  };

  const handleSignupComplete = () => {
    setIsDoneOpen(false);
    router.push('/login');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSignupPending || !termsAgreed) return;

    const nextErrors: SignupErrors = {
      profileType: profileType ? undefined : '프로필 타입을 선택해 주세요',
      nickname: profileType === 'personal' ? getNicknameError() : undefined,
      companyName:
        profileType === 'company' && !companyName.trim() ? '회사명을 입력해 주세요' : undefined,
      email: verifiedEmail ? undefined : AUTH_MESSAGE.VERIFICATION.EMAIL_REQUIRED,
      password: validatePassword(password),
      passwordConfirmation: validatePasswordConfirmation(password, passwordConfirmation),
    };

    setSignupErrors(nextErrors);

    const hasError = Object.values(nextErrors).some(Boolean);

    if (hasError) {
      if (nextErrors.profileType) {
        profileTypeRef.current?.focus();
      } else if (nextErrors.nickname) {
        nicknameRef.current?.focus();
      } else if (nextErrors.companyName) {
        companyNameRef.current?.focus();
      } else if (nextErrors.email) {
        emailRef.current?.focus();
      } else if (nextErrors.password) {
        passwordRef.current?.focus();
      } else if (nextErrors.passwordConfirmation) {
        passwordConfirmationRef.current?.focus();
      }

      return;
    }

    if (!profileType) return;

    const signupData: SignupRequest = {
      ...(profileType === 'personal'
        ? { profileType, nickname: nickname.trim() }
        : { profileType, companyName: companyName.trim() }),
      email: verifiedEmail,
      password,
      passwordConfirmation,
      termsAgreed,
    };

    try {
      await signup(signupData);
      setIsDoneOpen(true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        setSignupErrors((prev) => ({
          ...prev,
          email: AUTH_MESSAGE.EMAIL.ALREADY_REGISTERED,
        }));

        emailRef.current?.focus();
        return;
      }

      setSignupErrors((prev) => ({
        ...prev,
        email: AUTH_MESSAGE.SIGNUP.FAILED,
      }));
    }
  };

  return (
    <>
      <div className="flex flex-col gap-10">
        <h2 className="h-6 text-[20px] font-bold tracking-normal">회원가입</h2>

        <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5">
            <fieldset
              disabled={isSignupPending}
              aria-describedby="profile-type-description profile-type-error"
              className="flex flex-col gap-2"
            >
              <legend className="mb-2 font-medium">
                <span>프로필 타입</span>
                <span className="text-text-muted ml-2 text-xs font-normal">
                  회원가입 이후에는 프로필 타입을 변경할 수 없습니다
                </span>
              </legend>

              <div className="flex gap-5">
                {(
                  [
                    { value: 'personal', label: '개인 회원' },
                    { value: 'company', label: '기업 회원' },
                  ] as const
                ).map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-2">
                    <input
                      ref={option.value === 'personal' ? profileTypeRef : undefined}
                      type="radio"
                      name="profileType"
                      value={option.value}
                      checked={profileType === option.value}
                      onChange={() => handleProfileTypeChange(option.value)}
                      className="border-primary-700 checked:border-secondary-600 checked:after:bg-secondary-600 grid h-4 w-4 appearance-none place-content-center rounded-full border after:h-2 after:w-2 after:scale-0 after:rounded-full checked:after:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2"
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              <p id="profile-type-error" className="text-text-error text-xs">
                {signupErrors.profileType}
              </p>
            </fieldset>
            {profileType === 'personal' && (
              <Input
                ref={nicknameRef}
                label="닉네임"
                name="nickname"
                type="text"
                value={nickname}
                onChange={handleNicknameChange}
                placeholder="닉네임 입력"
                errorMessage={signupErrors.nickname}
                successMessage={
                  nicknameStatus === 'available' ? AUTH_MESSAGE.NICKNAME.AVAILABLE : undefined
                }
                rightAddon={
                  <InputActionButton
                    onClick={handleCheckNickname}
                    disabled={!nickname.trim() || nicknameStatus === 'checking'}
                  >
                    중복확인
                  </InputActionButton>
                }
                className="h-10 px-2 font-medium tracking-normal"
                showMessageSpace
              />
            )}
            {profileType === 'company' && (
              <Input
                ref={companyNameRef}
                label="회사명"
                name="companyName"
                type="text"
                value={companyName}
                onChange={(event) => {
                  setCompanyName(event.target.value);
                  setSignupErrors((prev) => ({ ...prev, companyName: undefined }));
                }}
                placeholder="회사명 입력"
                errorMessage={signupErrors.companyName}
                className="h-10 px-2 font-medium tracking-normal"
                showMessageSpace
              />
            )}
            <Input
              ref={emailRef}
              readOnly
              label="아이디"
              name="email"
              type="email"
              value={verifiedEmail}
              onClick={openVerify}
              placeholder="아이디 (이메일) 입력"
              errorMessage={signupErrors.email}
              successMessage={verifiedEmail ? AUTH_MESSAGE.EMAIL.AVAILABLE : undefined}
              rightAddon={
                <InputActionButton onClick={openVerify}>
                  {verifiedEmail ? '변경하기' : '입력하기'}
                </InputActionButton>
              }
              className="h-10 px-2 font-medium tracking-normal"
              showMessageSpace
            />
            <Input
              ref={passwordRef}
              label="비밀번호"
              name="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="비밀번호 입력"
              errorMessage={signupErrors.password}
              className="h-10 px-2 font-medium tracking-normal"
              showMessageSpace
            />
            <Input
              ref={passwordConfirmationRef}
              label="비밀번호 확인"
              name="passwordConfirmation"
              type="password"
              value={passwordConfirmation}
              onChange={handlePasswordConfirmationChange}
              placeholder="비밀번호 재입력"
              errorMessage={signupErrors.passwordConfirmation}
              successMessage={isPasswordMatched ? AUTH_MESSAGE.PASSWORD.MATCHED : undefined}
              className="h-10 px-2 font-medium tracking-normal"
              showMessageSpace
            />

            <div className="flex w-full items-center justify-between">
              <label className="flex flex-1 cursor-pointer items-center gap-1 select-none">
                <input
                  required
                  type="checkbox"
                  name="termsAgreed"
                  checked={termsAgreed}
                  onChange={(event) => setTermsAgreed(event.target.checked)}
                  className="peer sr-only"
                />

                <span className="border-primary-700 peer-checked:bg-secondary-400 relative inline-flex h-5 w-5 items-center justify-center rounded-xs border peer-checked:border-0 peer-focus-visible:outline-2 peer-checked:[&>svg]:opacity-100">
                  <CheckIcon className="h-3 w-3 text-gray-50 opacity-0 transition-opacity" />
                </span>

                <span className="text-sm">치즈 이용약관 동의</span>
              </label>

              <button
                type="button"
                onClick={openTerms}
                aria-label="치즈 이용약관 보기"
                className="flex h-5 w-5 items-center justify-center"
              >
                <ChevronIcon className="h-3" />
              </button>
            </div>
          </div>

          <Button
            variant="light"
            type="submit"
            disabled={!termsAgreed || isSignupPending}
            className="text-[16px]"
          >
            회원가입
          </Button>
        </form>

        <EmailVerifyModal
          title="아이디 (이메일) 입력"
          purpose="signup"
          isOpen={isVerifyOpen}
          onClose={closeVerify}
          onNext={handleEmailVerified}
        />
        <TermsModal isOpen={isTermsOpen} onClose={closeTerms} />
      </div>

      <AuthConfirmModal
        isOpen={isDoneOpen}
        title="회원가입 완료"
        description={'치즈에 오신 것을 환영합니다!'}
        primaryText="로그인하러 가기"
        onPrimaryClick={handleSignupComplete}
      />
    </>
  );
}

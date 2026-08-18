export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export function validateNickname(nickname: string) {
  const trimmedNickname = nickname.trim();

  if (!trimmedNickname) {
    return '닉네임을 입력해 주세요';
  }

  if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
    return '닉네임은 2~10자로 입력해 주세요';
  }

  return undefined;
}

export function validateEmail(email: string) {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return '이메일을 입력해 주세요';
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return '이메일이 올바르지 않습니다';
  }

  return undefined;
}

export function validatePassword(password: string) {
  if (!password) {
    return '비밀번호를 입력해 주세요';
  }

  if (!PASSWORD_REGEX.test(password)) {
    return '영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다';
  }

  return undefined;
}

export function validatePasswordConfirmation(password: string, passwordConfirmation: string) {
  if (!passwordConfirmation) {
    return '비밀번호를 다시 입력해 주세요';
  }

  if (password !== passwordConfirmation) {
    return '비밀번호가 일치하지 않습니다';
  }

  return undefined;
}

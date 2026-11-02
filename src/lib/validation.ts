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

export function validateCompanyName(companyName: string) {
  const trimmedCompanyName = companyName.trim();

  if (!trimmedCompanyName) {
    return '회사명을 입력해 주세요';
  }

  if (trimmedCompanyName.length < 2 || trimmedCompanyName.length > 20) {
    return '회사명은 2~20자로 입력해 주세요';
  }

  return undefined;
}

export function validateEmployeeCount(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) return undefined;

  const count = Number(trimmed);

  if (!Number.isInteger(count) || count < 0) {
    return '사원수는 0명 이상의 정수로 입력해주세요.';
  }

  if (count > 9999999) {
    return '사원수는 최대 9,999,999명까지 입력할 수 있습니다.';
  }

  return undefined;
}

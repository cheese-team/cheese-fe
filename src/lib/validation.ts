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

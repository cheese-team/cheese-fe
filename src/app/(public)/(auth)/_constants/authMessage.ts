export const AUTH_MESSAGE = {
  LOGIN: {
    INVALID: '아이디 또는 비밀번호가 일치하지 않습니다',
  },

  EMAIL: {
    UNREGISTERED: '가입되지 않은 이메일입니다',
    ALREADY_REGISTERED: '이미 가입된 이메일입니다',
    AVAILABLE: '사용 가능',
    SEND_SUCCESS: '인증 메일이 발송되었습니다',
    SEND_FAILED: '인증 메일 발송에 실패했습니다',
  },

  PASSWORD: {
    MATCHED: '비밀번호가 일치합니다',
    RESET_FAILED: '비밀번호 변경에 실패했습니다. 다시 시도해 주세요',
  },

  VERIFICATION: {
    REQUIRED: '인증번호를 입력해주세요',
    INVALID: '인증번호가 일치하지 않습니다',
    MATCHED: '인증번호가 일치합니다',
    EXPIRED: '인증번호가 만료되었습니다. 다시 발송해 주세요',
    EMAIL_REQUIRED: '이메일 인증을 완료해 주세요',
  },

  NICKNAME: {
    CHECK_REQUIRED: '닉네임 중복확인을 완료해 주세요',
    FAILED: '닉네임 중복 확인에 실패했습니다',
    DUPLICATED: '중복된 닉네임이 있습니다',
    AVAILABLE: '사용 가능한 닉네임입니다',
  },

  SIGNUP: {
    FAILED: '회원가입에 실패했습니다. 다시 시도해 주세요',
  },
} as const;

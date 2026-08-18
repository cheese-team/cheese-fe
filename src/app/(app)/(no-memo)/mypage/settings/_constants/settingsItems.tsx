import { CookieIcon, LanguageIcon, StartpageIcon, ThemeIcon } from '@/assets/icons/settings';

export const SETTINGS_ITEMS = [
  {
    key: 'theme',
    label: '테마',
    value: '사용하실 테마를 선택해주세요',
    icon: <ThemeIcon className="h-6" />,
    options: ['시스템 설정'],
  },
  {
    key: 'language',
    label: '언어',
    value: 'Select your language',
    icon: <LanguageIcon className="h-6" />,
    options: ['한국어'],
  },
  {
    key: 'startPage',
    label: '시작페이지',
    value: '치즈를 시작할 때 표시할 페이지를 선택해주세요',
    icon: <StartpageIcon className="h-6" />,
    options: ['홈', '일정 관리', '메모', '문제 풀이', '커뮤니티'],
  },
  {
    key: 'cookie',
    label: '쿠키 설정',
    value: '쿠키를 설정해주세요',
    icon: <CookieIcon className="h-6" />,
    options: ['모든 쿠키 허용', '필수 쿠키만 허용'],
  },
] as const;

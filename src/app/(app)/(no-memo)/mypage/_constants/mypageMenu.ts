export const MYPAGE_MENU_ITEMS = [
  { label: '마이페이지', href: '/mypage', icon: 'mypage' },
  { label: '내 관심글', href: '/mypage/bookmarks', icon: 'bookmarks' },
  { label: '지원현황', href: '/mypage/applications', icon: 'applications' },
  { label: '설정', href: '/mypage/settings', icon: 'settings' },
] as const;

export const ADMIN_MENU_ITEMS = [
  { label: '문제 관리', href: '/mypage/admin/problem', icon: 'problem' },
  { label: '커뮤니티 신고', href: '/mypage/admin/reports', icon: 'reports' },
] as const;

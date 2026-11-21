import type { ReportListItem } from '../_types/report';

export const MOCK_REPORTS: ReportListItem[] = [
  {
    id: 'mock-report-001',
    targetType: 'jobs',
    targetId: 'mock-target-001',
    reason: '운영 규칙 위반',
    status: 'pending',
    reporter: {
      id: 'mock-user-001',
      nickname: '예시 사용자 001',
    },
    createdAt: '2026-11-20T09:00:00+09:00',
  },
  {
    id: 'mock-report-002',
    targetType: 'comment',
    targetId: 'mock-target-002',
    reason: '운영 규칙 위반',
    status: 'pending',
    reporter: {
      id: 'mock-user-002',
      nickname: '예시 사용자 002',
    },
    createdAt: '2026-11-20T09:00:00+09:00',
  },
  {
    id: 'mock-report-003',
    targetType: 'groups',
    targetId: 'mock-target-003',
    reason: '운영 규칙 위반',
    status: 'resolved',
    reporter: {
      id: 'mock-user-003',
      nickname: '예시 사용자 003',
    },
    createdAt: '2026-11-20T09:00:00+09:00',
  },
  {
    id: 'mock-report-004',
    targetType: 'info',
    targetId: 'mock-target-004',
    reason: '운영 규칙 위반',
    status: 'dismissed',
    reporter: {
      id: 'mock-user-004',
      nickname: '예시 사용자 004',
    },
    createdAt: '2026-11-20T09:00:00+09:00',
  },
  {
    id: 'mock-report-005',
    targetType: 'comment',
    targetId: 'mock-target-005',
    reason: '운영 규칙 위반',
    status: 'resolved',
    reporter: {
      id: 'mock-user-005',
      nickname: '예시 사용자 005',
    },
    createdAt: '2026-11-20T09:00:00+09:00',
  },
  {
    id: 'mock-report-006',
    targetType: 'comment',
    targetId: 'mock-target-006',
    reason: '운영 규칙 위반',
    status: 'dismissed',
    reporter: {
      id: 'mock-user-006',
      nickname: '예시 사용자 006',
    },
    createdAt: '2026-11-20T09:00:00+09:00',
  },
];

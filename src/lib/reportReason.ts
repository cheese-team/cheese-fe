import type { CommunityReportTargetType } from '@/types/community/report';

const POST_ID_PATTERN = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

/**
 * 현재 신고 API에서 댓글이 속한 게시글 ID를 별도로 지원하지 않아
 * 신고 사유(reason)에 postId를 포함한 JSON 문자열을 전달하는 임시 구현입니다.
 *
 * TODO: 백엔드 신고 API에 postId 필드가 추가되면 직렬화 및 파싱 로직을 제거하고
 * 별도 필드를 사용하도록 변경합니다. 기존 JSON 형식 신고 데이터의 호환성도 고려해야 합니다.
 */
export function serializeReportReason(reason: string, postId: string): string {
  return JSON.stringify({ version: 1, reason, postId });
}

export function parseReportReason(
  targetType: CommunityReportTargetType,
  reason: string,
): { reason: string; postId?: string } {
  if (targetType !== 'comment' || !reason?.trimStart().startsWith('{')) return { reason };

  try {
    const value: unknown = JSON.parse(reason);
    if (
      typeof value === 'object' &&
      value !== null &&
      'version' in value &&
      value.version === 1 &&
      'reason' in value &&
      typeof value.reason === 'string' &&
      value.reason.trim() &&
      'postId' in value &&
      typeof value.postId === 'string' &&
      POST_ID_PATTERN.test(value.postId)
    ) {
      return { reason: value.reason, postId: value.postId };
    }
  } catch {
    // Legacy reasons can be arbitrary text, including malformed JSON.
  }

  return { reason };
}

type Deadline = string | null;

export function formatDeadline(deadline: Deadline) {
  if (!deadline) {
    return '상시모집';
  }

  const date = new Date(deadline);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return `${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}(${weekdays[date.getDay()]}) 마감`;
}

export function getDeadlineTime(deadline: Deadline) {
  if (!deadline) {
    return Number.MAX_SAFE_INTEGER;
  }

  return new Date(deadline).getTime();
}

export function isRecruitClosed(deadline: Deadline) {
  if (!deadline) return false;

  return new Date(deadline) < new Date();
}

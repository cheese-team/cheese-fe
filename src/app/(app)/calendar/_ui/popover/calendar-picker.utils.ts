export function getMonthDays(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  return Array.from(
    { length: 42 },
    (_, index) => new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay() + index),
  );
}

export function moveMonth(date: Date, amount: number) {
  const month = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  month.setDate(Math.min(date.getDate(), lastDay));
  return month;
}

export function getTimeParts(time: string) {
  const [hour, minute] = time.split(':');
  return {
    period: Number(hour) < 12 ? '오전' : '오후',
    hour: String(Number(hour) % 12 || 12).padStart(2, '0'),
    minute,
  };
}

export function to24HourTime(period: string, hour: string, minute: string) {
  const hour24 = (Number(hour) % 12) + (period === '오후' ? 12 : 0);
  return `${String(hour24).padStart(2, '0')}:${minute}`;
}

export function getTimeLabel(time: string) {
  if (!time) return '시간 선택';
  const { period, hour, minute } = getTimeParts(time);
  return `${period} ${Number(hour)}:${minute}`;
}

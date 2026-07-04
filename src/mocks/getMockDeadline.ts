export default function getMockDeadline(daysFromToday: number | null) {
  if (daysFromToday === null) return null;

  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);

  return date.toISOString().split('T')[0];
}

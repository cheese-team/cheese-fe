export function formatLikeCount(count: number): string {
  return count >= 1000 ? '+999' : String(count);
}

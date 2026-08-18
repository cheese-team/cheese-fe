import type { ProblemSet } from '../../problem/_types/problem';

export function isInProgressProblemSet(problemSet: ProblemSet) {
  return (
    problemSet.solvedCount > 0 &&
    problemSet.totalCount > 0 &&
    problemSet.solvedCount < problemSet.totalCount
  );
}

export function getInProgressProblemSets(problemSets: ProblemSet[]) {
  return problemSets.filter(isInProgressProblemSet).sort((left, right) => {
    const leftDate = left.lastProgressDate ?? '';
    const rightDate = right.lastProgressDate ?? '';

    return rightDate.localeCompare(leftDate);
  });
}

// export const PROBLEM_CARD_WIDTH = 231;
// export const PROBLEM_CARD_GAP = 12;
// export const PROBLEM_CARD_SCROLL_STEP = PROBLEM_CARD_WIDTH + PROBLEM_CARD_GAP;
// export const PROBLEM_CARD_VISIBLE_COUNT = 4;

// export function getProblemCarouselViewportWidth(visibleCount: number) {
//   if (visibleCount <= 0) {
//     return 0;
//   }

//   return visibleCount * PROBLEM_CARD_WIDTH + Math.max(visibleCount - 1, 0) * PROBLEM_CARD_GAP;
// }

// export function getProblemCarouselMaxStartIndex(totalCount: number) {
//   return Math.max(0, totalCount - PROBLEM_CARD_VISIBLE_COUNT);
// }

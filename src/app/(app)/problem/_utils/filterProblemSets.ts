import type {
  ProblemMainCategory,
  ProblemSet,
  ProblemSortValue,
  ProblemSubCategory,
} from '../_types/problem';

type FilterProblemSetsParams = {
  problemSets: ProblemSet[];
  mainCategory: ProblemMainCategory;
  subCategory: ProblemSubCategory;
  keyword: string;
  sort: ProblemSortValue;
};

export function filterProblemSets({
  problemSets,
  mainCategory,
  subCategory,
  keyword,
  sort,
}: FilterProblemSetsParams) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  const filteredProblemSets = problemSets.filter((problemSet) => {
    const isMainCategoryMatched = mainCategory === 'all' || problemSet.category === mainCategory;

    const isSubCategoryMatched = subCategory === 'all' || problemSet.subCategory === subCategory;

    const isKeywordMatched =
      normalizedKeyword.length === 0 ||
      problemSet.title.toLowerCase().includes(normalizedKeyword) ||
      problemSet.category.toLowerCase().includes(normalizedKeyword) ||
      problemSet.subCategory?.toLowerCase().includes(normalizedKeyword);

    return isMainCategoryMatched && isSubCategoryMatched && isKeywordMatched;
  });

  return [...filteredProblemSets].sort((a, b) => {
    if (sort === 'name') {
      return a.title.localeCompare(b.title);
    }

    if (sort === 'progressDate') {
      return b.lastProgressDate.localeCompare(a.lastProgressDate);
    }

    return b.createdAt.localeCompare(a.createdAt);
  });
}

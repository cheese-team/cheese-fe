import { notFound } from 'next/navigation';

import {
  getProblemQuestion,
  getProblemQuestionIndex,
} from '@/app/(app)/problem/_data/mockProblemSolving';
import ProblemQuestionView from '@/app/(app)/problem/_views/ProblemQuestionView';

type ProblemQuestionPageProps = {
  params: Promise<{
    problemSetId: string;
    questionId: string;
  }>;
  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function ProblemQuestionPage({
  params,
  searchParams,
}: ProblemQuestionPageProps) {
  const { problemSetId, questionId } = await params;
  const { from } = await searchParams;

  const question = getProblemQuestion(questionId);
  const questionIndex = getProblemQuestionIndex(questionId);

  if (!question || questionIndex < 0) {
    notFound();
  }

  return (
    <ProblemQuestionView
      key={question.id}
      problemSetId={problemSetId}
      question={question}
      questionIndex={questionIndex}
      isReviewMode={from === 'result'}
    />
  );
}

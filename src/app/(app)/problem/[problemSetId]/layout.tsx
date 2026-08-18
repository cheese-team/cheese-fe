import type { ReactNode } from 'react';

import { ProblemSolvingSessionProvider } from '../_contexts/ProblemSolvingSessionContext';

export default async function ProblemSetLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ problemSetId: string }>;
}) {
  const { problemSetId } = await params;

  return (
    <ProblemSolvingSessionProvider problemSetId={problemSetId}>
      {children}
    </ProblemSolvingSessionProvider>
  );
}

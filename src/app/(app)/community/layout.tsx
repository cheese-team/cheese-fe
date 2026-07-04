import { Suspense } from 'react';

import CommunityLayoutContent from './_components/Layout/CommunityLayoutContent';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <CommunityLayoutContent>{children}</CommunityLayoutContent>
    </Suspense>
  );
}

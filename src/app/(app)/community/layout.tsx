import { Suspense } from 'react';

import CommunityLayoutContent from './_components/Layout';
import CommunityPostNavigationProvider from './_components/Layout/CommunityPostNavigationProvider';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <CommunityPostNavigationProvider>
        <CommunityLayoutContent>{children}</CommunityLayoutContent>
      </CommunityPostNavigationProvider>
    </Suspense>
  );
}

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const LEAVE_MESSAGE = '작성 중인 내용이 사라집니다. 이동하시겠습니까?';
const POST_FORM_PATH = /^\/community\/(jobs|groups|info)\/(create|[^/]+\/edit)\/?$/;

type CommunityPostNavigation = {
  navigate: (href: string) => void;
  replaceAfterSave: (href: string) => void;
};

type NavigationSession = {
  id: symbol;
  pathname: string;
  isLeaving: boolean;
  approvedHref: string | null;
  canUnload: boolean;
};

// Navigation API가 없는 브라우저와 DOM 타입 정의도 지원한다.
type BrowserNavigateEvent = Event & {
  navigationType: string;
  destination: { url: string; sameDocument: boolean };
};

function isBrowserNavigateEvent(event: Event): event is BrowserNavigateEvent {
  return (
    'navigationType' in event &&
    typeof event.navigationType === 'string' &&
    'destination' in event &&
    typeof event.destination === 'object' &&
    event.destination !== null &&
    'url' in event.destination &&
    typeof event.destination.url === 'string' &&
    'sameDocument' in event.destination &&
    typeof event.destination.sameDocument === 'boolean'
  );
}

function isSamePage(destination: URL) {
  return (
    destination.origin === window.location.origin &&
    destination.pathname === window.location.pathname &&
    destination.search === window.location.search
  );
}

function approveNavigation(session: NavigationSession, destination: URL) {
  session.isLeaving = true;
  session.approvedHref = destination.href;
}

function resetNavigation(session: NavigationSession) {
  session.isLeaving = false;
  session.approvedHref = null;
  session.canUnload = false;
}

const CommunityPostNavigationContext = createContext<CommunityPostNavigation | null>(null);

export default function CommunityPostNavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [restoreCount, setRestoreCount] = useState(0);
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const sessionId = useMemo(() => Symbol(`${routeKey}:${restoreCount}`), [routeKey, restoreCount]);
  const sessionRef = useRef<NavigationSession | null>(null);

  useLayoutEffect(() => {
    const session: NavigationSession = {
      id: sessionId,
      pathname,
      isLeaving: false,
      approvedHref: null,
      canUnload: false,
    };
    sessionRef.current = session;

    if (!POST_FORM_PATH.test(pathname)) {
      return () => {
        sessionRef.current = null;
      };
    }

    const navigation =
      'navigation' in window && window.navigation instanceof EventTarget ? window.navigation : null;
    let unloadResetTimer: number | undefined;

    const allowDocumentUnload = () => {
      session.canUnload = true;
      window.clearTimeout(unloadResetTimer);
      // 승인된 문서 이동의 beforeunload에만 적용하고 이후 새로고침/닫기에는 남기지 않는다.
      unloadResetTimer = window.setTimeout(() => {
        session.canUnload = false;
      }, 0);
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        !event.cancelable ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const anchor = event.target.closest('a[href]');
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.isContentEditable ||
        anchor.hasAttribute('download') ||
        (anchor.target && anchor.target.toLowerCase() !== '_self')
      ) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      // 외부 사이트로의 문서 이동은 beforeunload에서 브라우저 기본 경고를 사용한다.
      if (
        !['http:', 'https:'].includes(destination.protocol) ||
        destination.origin !== window.location.origin ||
        isSamePage(destination)
      ) {
        return;
      }

      if (!window.confirm(LEAVE_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      approveNavigation(session, destination);
      if (!navigation) allowDocumentUnload();
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (session.canUnload) {
        session.canUnload = false;
        return;
      }

      event.preventDefault();
      event.returnValue = true;
    };

    const handleNavigate = (event: Event) => {
      if (!isBrowserNavigateEvent(event)) return;

      session.canUnload = false;
      const destination = new URL(event.destination.url, window.location.href);

      if (!event.destination.sameDocument) {
        if (
          (event.navigationType === 'push' || event.navigationType === 'replace') &&
          session.approvedHref === destination.href
        ) {
          // 실제 목적지를 확인한 문서 이동은 다음 beforeunload 한 번만 허용한다.
          session.canUnload = true;
        }
        return;
      }

      // Next.js가 이미 처리 중인 push/replace의 history commit은 차단하지 않는다.
      if (event.navigationType !== 'traverse' || isSamePage(destination)) return;
      if (!event.cancelable) {
        // 뒤로가기 취소로 history-action activation이 소모되면 반복 이동은 취소할 수 없다.
        // 이때 confirm을 표시해도 취소를 보장할 수 없으므로 이탈 중인 상태만 기록한다.
        session.isLeaving = true;
        return;
      }

      if (!window.confirm(LEAVE_MESSAGE)) {
        event.preventDefault();
        // navigateerror 발생 여부와 관계없이 취소 직후 작성 세션을 복구한다.
        resetNavigation(session);
        return;
      }

      approveNavigation(session, destination);
    };

    const handleNavigateError = () => {
      resetNavigation(session);
    };

    const handlePageHide = () => {
      session.isLeaving = true;
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setRestoreCount((count) => count + 1);
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    navigation?.addEventListener('navigate', handleNavigate);
    navigation?.addEventListener('navigateerror', handleNavigateError);

    return () => {
      sessionRef.current = null;
      window.clearTimeout(unloadResetTimer);
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      navigation?.removeEventListener('navigate', handleNavigate);
      navigation?.removeEventListener('navigateerror', handleNavigateError);
    };
  }, [pathname, sessionId]);

  const navigate = useCallback(
    (href: string) => {
      const session = sessionRef.current;
      if (!session || session.id !== sessionId || session.pathname !== window.location.pathname) {
        return;
      }

      const destination = new URL(href, window.location.href);
      if (!isSamePage(destination)) {
        if (POST_FORM_PATH.test(pathname) && !window.confirm(LEAVE_MESSAGE)) return;
        approveNavigation(session, destination);
      }

      try {
        router.push(href);
      } catch (error) {
        resetNavigation(session);
        throw error;
      }
    },
    [pathname, router, sessionId],
  );

  const replaceAfterSave = useCallback(
    (href: string) => {
      const session = sessionRef.current;
      // 이전 작성 세션에서 시작한 저장이나 이미 이탈을 승인한 저장 결과는 이동하지 않는다.
      if (
        !session ||
        session.id !== sessionId ||
        session.pathname !== window.location.pathname ||
        session.isLeaving
      ) {
        return;
      }

      approveNavigation(session, new URL(href, window.location.href));
      try {
        router.replace(href);
      } catch (error) {
        resetNavigation(session);
        throw error;
      }
    },
    [router, sessionId],
  );

  const value = useMemo(() => ({ navigate, replaceAfterSave }), [navigate, replaceAfterSave]);

  return (
    <CommunityPostNavigationContext.Provider value={value}>
      {children}
    </CommunityPostNavigationContext.Provider>
  );
}

export function useCommunityPostNavigation() {
  const context = useContext(CommunityPostNavigationContext);
  if (!context) {
    throw new Error(
      'useCommunityPostNavigation must be used within CommunityPostNavigationProvider',
    );
  }
  return context;
}

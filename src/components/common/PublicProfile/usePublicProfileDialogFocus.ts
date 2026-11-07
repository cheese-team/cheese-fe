'use client';

import { useEffect, useRef } from 'react';

/**
 * 로딩 화면이 프로필 카드로 바뀌어도 Tab 탐색을 모달 안에 유지한다.
 * 닫은 뒤 포커스가 본문으로 빠졌을 때만 모달을 열었던 요소로 돌려보낸다.
 */
export function usePublicProfileDialogFocus(isOpen: boolean, trigger?: HTMLElement) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const activeElement = document.activeElement;

    if (trigger) {
      previousFocusRef.current = trigger;
    } else if (
      activeElement instanceof HTMLElement &&
      !dialogRef.current?.contains(activeElement)
    ) {
      previousFocusRef.current = activeElement;
    }

    const focusDialog = () => {
      const dialog = dialogRef.current;

      if (!dialog) return;

      if (!dialog.contains(document.activeElement)) {
        dialog.focus();
      }
    };

    focusDialog();

    const observer = new MutationObserver(focusDialog);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (
          activeElement === first ||
          activeElement === dialog ||
          !dialog.contains(activeElement)
        ) {
          event.preventDefault();
          last.focus();
        }
      } else if (activeElement === last || !dialog.contains(activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyDown);

      const previousFocus = previousFocusRef.current;

      requestAnimationFrame(() => {
        if (previousFocus?.isConnected && document.activeElement === document.body)
          previousFocus.focus({ preventScroll: true });
      });
    };
  }, [isOpen, trigger]);

  return dialogRef;
}

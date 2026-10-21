'use client';

import { useEffect, useRef } from 'react';

export function usePublicProfileDialogFocus(isOpen: boolean) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

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

      if (previousFocus?.isConnected) {
        previousFocus.focus();
      }
    };
  }, [isOpen]);

  return dialogRef;
}

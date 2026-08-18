import { useEffect } from 'react';

type UseModalBehaviorProps = {
  isOpen: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  lockBodyScroll?: boolean;
};

/**
 * 모달 열림 상태에서
 * - ESC 키 닫기
 * - body 스크롤 차단
 */
export function useModalBehavior({
  isOpen,
  onClose,
  closeOnEscape = true,
  lockBodyScroll = true,
}: UseModalBehaviorProps) {
  // ESC 키 닫기
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEscape]);

  // body 스크롤 차단
  useEffect(() => {
    if (!isOpen || !lockBodyScroll) return;

    const body = document.body;

    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [isOpen, lockBodyScroll]);
}

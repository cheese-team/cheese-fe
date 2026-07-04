import { useEffect } from 'react';

type UseModalBehaviorProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * 모달 열림 상태에서
 * - ESC 키 닫기
 * - body 스크롤 차단
 */
export function useModalBehavior({ isOpen, onClose }: UseModalBehaviorProps) {
  // ESC 키 닫기
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // body 스크롤 차단
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);
}

'use client';

import { createPortal } from 'react-dom';

import DraggableModal from './DraggableModal';

import { useModalBehavior } from '@/hooks/useModalBehavior';

import { cn } from '@/lib/cn';

type ModalScope = 'viewport' | 'content';

type ModalInteraction = 'default' | 'interactive';

type DefaultInteractionProps = {
  interaction?: 'default';
  hasOverlay?: boolean;
};

type InteractiveInteractionProps = {
  interaction: 'interactive';
  hasOverlay?: false;
};

type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;

  hasOverlay?: boolean;
  closeOnEscape?: boolean;
  interaction?: ModalInteraction;

  scope?: ModalScope;
  contentClassName?: string;

  draggable?: boolean;
  dragHandleSelector?: string;
} & (DefaultInteractionProps | InteractiveInteractionProps);

export default function BaseModal({
  isOpen,
  onClose,
  children,

  hasOverlay,
  closeOnEscape = true,
  interaction = 'default',

  scope = 'viewport',
  contentClassName,

  draggable,
  dragHandleSelector,
}: BaseModalProps) {
  const isInteractive = interaction === 'interactive';
  const closeOnOutsideClick = !isInteractive;
  const lockBodyScroll = !isInteractive;

  useModalBehavior({ isOpen, onClose, closeOnEscape, lockBodyScroll });

  if (!isOpen) return null;
  if (typeof window === 'undefined') return null;

  const contentTarget = document.getElementById('app-main');

  if (scope === 'content' && !contentTarget && process.env.NODE_ENV === 'development') {
    console.warn('BaseModal: #app-main target was not found. Falling back to document.body.');
  }

  const isContentScope = scope === 'content' && !!contentTarget;
  const portalTarget = isContentScope ? contentTarget : document.body;

  const modalContent = (
    <div
      className={cn(
        'max-h-full max-w-full',
        isInteractive && 'pointer-events-auto',
        contentClassName,
      )}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  );

  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnOutsideClick) return;

    if (event.target !== event.currentTarget) return;

    onClose();
  };

  return createPortal(
    <div
      className={cn(
        'z-50 overflow-hidden',
        isContentScope ? 'absolute inset-0' : 'fixed inset-0',
        isInteractive && 'pointer-events-none',
        hasOverlay && 'bg-overlay-dim',
      )}
      role="presentation"
    >
      <div
        className="flex h-full w-full items-center justify-center p-5"
        onClick={handleOutsideClick}
      >
        {draggable ? (
          <DraggableModal dragHandleSelector={dragHandleSelector}>{modalContent}</DraggableModal>
        ) : (
          modalContent
        )}
      </div>
    </div>,
    portalTarget,
  );
}

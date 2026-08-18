'use client';

import { useEffect, useRef, useState } from 'react';

type Position = {
  x: number;
  y: number;
};

type DragStart = {
  pointerX: number;
  pointerY: number;
  positionX: number;
  positionY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

type DraggableModalProps = {
  children: React.ReactNode;
  dragHandleSelector?: string;
};

export default function DraggableModal({
  children,
  dragHandleSelector = '[data-drag-handle]',
}: DraggableModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  const dragStartRef = useRef<DragStart | null>(null);

  useEffect(() => {
    const modalElement = containerRef.current;

    if (!modalElement) return;

    const dragHandles = modalElement.querySelectorAll<HTMLElement>(dragHandleSelector);

    dragHandles.forEach((handle) => {
      handle.style.touchAction = 'none';
      handle.style.userSelect = 'none';
    });

    return () => {
      dragHandles.forEach((handle) => {
        handle.style.touchAction = '';
        handle.style.userSelect = '';
      });
    };
  }, [dragHandleSelector]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    if (target.closest('button, a, input, textarea, select, [data-no-drag]')) {
      return;
    }

    if (!target.closest(dragHandleSelector)) return;

    const modalElement = containerRef.current;
    const boundaryElement = modalElement?.parentElement;

    if (!modalElement || !boundaryElement) return;

    e.preventDefault();

    const modalRect = modalElement.getBoundingClientRect();
    const boundaryRect = boundaryElement.getBoundingClientRect();

    const boundaryPadding = 0;

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      positionX: position.x,
      positionY: position.y,

      minX: position.x + boundaryRect.left + boundaryPadding - modalRect.left,
      maxX: position.x + boundaryRect.right - boundaryPadding - modalRect.right,
      minY: position.y + boundaryRect.top + boundaryPadding - modalRect.top,
      maxY: position.y + boundaryRect.bottom - boundaryPadding - modalRect.bottom,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current;

    if (!dragStart) return;

    const nextX = dragStart.positionX + e.clientX - dragStart.pointerX;

    const nextY = dragStart.positionY + e.clientY - dragStart.pointerY;

    setPosition({
      x: Math.min(Math.max(nextX, dragStart.minX), dragStart.maxX),
      y: Math.min(Math.max(nextY, dragStart.minY), dragStart.maxY),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = null;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {children}
    </div>
  );
}

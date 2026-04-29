import React, { useState } from 'react';
import { WindowControls } from './WindowControls';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface ResizableCriteriaWindowProps {
  title: string;
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
  initialWidth?: number;
  initialHeight?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WINDOW_DEFAULTS = {
  minWidth: 350,
  minHeight: 200,
  initialWidth: 400,
  initialHeight: 300,
} as const;

const RESIZE_HANDLE_EDGE_SIZE = 'h-1 w-full'; // 4px edge handles
const RESIZE_HANDLE_CORNER_SIZE = 'w-2 h-2';  // 8px corner handles

// ─── Resize Handle Definitions ───────────────────────────────────────────────

interface ResizeHandleConfig {
  direction: string;
  className: string;
}

const RESIZE_HANDLES: ResizeHandleConfig[] = [
  // Edges
  { direction: 'n',  className: `absolute top-0 left-0 right-0 ${RESIZE_HANDLE_EDGE_SIZE} cursor-n-resize z-10` },
  { direction: 's',  className: `absolute bottom-0 left-0 right-0 ${RESIZE_HANDLE_EDGE_SIZE} cursor-s-resize z-10` },
  { direction: 'w',  className: `absolute top-0 bottom-0 left-0 w-1 h-full cursor-w-resize z-10` },
  { direction: 'e',  className: `absolute top-0 bottom-0 right-0 w-1 h-full cursor-e-resize z-10` },
  // Corners (higher z-index to take priority over edges)
  { direction: 'nw', className: `absolute top-0 left-0 ${RESIZE_HANDLE_CORNER_SIZE} cursor-nw-resize z-20` },
  { direction: 'ne', className: `absolute top-0 right-0 ${RESIZE_HANDLE_CORNER_SIZE} cursor-ne-resize z-20` },
  { direction: 'sw', className: `absolute bottom-0 left-0 ${RESIZE_HANDLE_CORNER_SIZE} cursor-sw-resize z-20` },
  { direction: 'se', className: `absolute bottom-0 right-0 ${RESIZE_HANDLE_CORNER_SIZE} cursor-se-resize z-20` },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const ResizableCriteriaWindow: React.FC<ResizableCriteriaWindowProps> = ({
  title,
  windowState,
  onClose,
  onUpdateState,
  onFocus,
  children,
  footer,
  minWidth  = WINDOW_DEFAULTS.minWidth,
  minHeight = WINDOW_DEFAULTS.minHeight,
  initialWidth  = WINDOW_DEFAULTS.initialWidth,
  initialHeight = WINDOW_DEFAULTS.initialHeight,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);

  const currentWidth  = windowState.width  || initialWidth;
  const currentHeight = windowState.height || initialHeight;

  // ── Drag Handler ────────────────────────────────────────────────────────────

  const handleDragStart = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.window-header')) return;

    e.preventDefault();
    onFocus();
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const originX = windowState.x;
    const originY = windowState.y;

    const onMouseMove = (ev: MouseEvent) => {
      onUpdateState({
        x: originX + (ev.clientX - startX),
        y: originY + (ev.clientY - startY),
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // ── Resize Handler ──────────────────────────────────────────────────────────

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    onFocus();
    setIsResizing(direction);

    const startX = e.clientX;
    const startY = e.clientY;
    const originX = windowState.x;
    const originY = windowState.y;
    const originW = currentWidth;
    const originH = currentHeight;

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startX;
      const deltaY = ev.clientY - startY;

      let x = originX;
      let y = originY;
      let newWidth  = originW;
      let newHeight = originH;

      if (direction.includes('e')) newWidth  = Math.max(minWidth,  originW + deltaX);
      if (direction.includes('s')) newHeight = Math.max(minHeight, originH + deltaY);

      if (direction.includes('w')) {
        newWidth = Math.max(minWidth, originW - deltaX);
        if (newWidth !== originW) x = originX + (originW - newWidth);
      }
      if (direction.includes('n')) {
        newHeight = Math.max(minHeight, originH - deltaY);
        if (newHeight !== originH) y = originY + (originH - newHeight);
      }

      onUpdateState({ x, y, width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      setIsResizing(null);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // ── Early Return ────────────────────────────────────────────────────────────

  if (windowState.isMinimized) return null;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="absolute flex flex-col bg-[#f0f0f0] border border-gray-400 shadow-[2px_2px_10px_rgba(0,0,0,0.3)] rounded-[2px] overflow-hidden select-none"
      style={{
        left:   windowState.x,
        top:    windowState.y,
        width:  currentWidth,
        height: currentHeight,
        zIndex: windowState.zIndex,
      }}
      onClick={onFocus}
      aria-label={title}
      role="dialog"
      aria-modal="true"
      data-dragging={isDragging}
      data-resizing={isResizing ?? undefined}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleDragStart}
        className="window-header h-[24px] bg-gradient-to-b from-[#e6e6e6] to-[#cccccc] border-b border-gray-400 flex items-center justify-between px-2 cursor-default shrink-0"
      >
        <span className="text-[11px] text-gray-800 font-medium truncate">{title}</span>
        <WindowControls
          onClose={onClose}
          onMinimize={() => onUpdateState({ isMinimized: true })}
          onMaximize={() => onUpdateState({ isMaximized: !windowState.isMaximized })}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
        {children}
      </div>

      {/* Optional Footer */}
      {footer}

      {/* Resize Handles */}
      {RESIZE_HANDLES.map(({ direction, className }) => (
        <div
          key={direction}
          onMouseDown={(e) => handleResizeStart(e, direction)}
          className={className}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

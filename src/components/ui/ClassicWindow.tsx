import React, { useCallback, useEffect, useRef } from 'react';
import { X, Minus, Square, AlertCircle, CheckCircle2, Plus, Trash2, RefreshCw } from 'lucide-react';
import { cn } from './ClassicERPUI';

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export interface ClassicWindowProps {
  title: string;
  icon?: React.ReactNode;
  /** Colour of the accent strip under the title bar. */
  accent?: string;
  /**
   * Optional: some call sites gate rendering themselves with
   * `{wm.showX && <Window .../>}` and pass no `show` prop at all. Defaulting to
   * true keeps both conventions working.
   */
  show?: boolean;
  onClose: () => void;
  onFocus?: () => void;
  windowState: WindowState;
  /**
   * Accepts either the `setWindowState` dispatcher some windows pass or the
   * `onUpdateState(partial)` callback others use, so the shell drops into both
   * call sites without changing the parent.
   */
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  minWidth?: number;
  minHeight?: number;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Shared window chrome: title bar, minimise/maximise/close, drag and the eight
 * resize handles.
 *
 * Each SAP-style window used to carry its own ~80-line copy of this, which is
 * why the drag listeners were leaking on unmount in several of them. Centralising
 * it means the cleanup is written once and every window gets it.
 */
export const ClassicWindow: React.FC<ClassicWindowProps> = ({
  title,
  icon,
  accent = '#f39c12',
  show = true,
  onClose,
  onFocus,
  windowState,
  setWindowState,
  onUpdateState,
  minWidth = 620,
  minHeight = 420,
  toolbar,
  footer,
  children,
}) => {
  // Tracks the listeners attached during an in-flight drag/resize so they can
  // be torn down if the window unmounts mid-gesture.
  const teardownRef = useRef<(() => void) | null>(null);

  useEffect(() => () => teardownRef.current?.(), []);

  const patch = useCallback(
    (next: Partial<WindowState> | ((prev: WindowState) => WindowState)) => {
      if (typeof next === 'function') {
        if (setWindowState) setWindowState(next);
        else if (onUpdateState) onUpdateState(next(windowState));
        return;
      }
      if (setWindowState) setWindowState((p) => ({ ...p, ...next }));
      else onUpdateState?.(next);
    },
    [setWindowState, onUpdateState, windowState],
  );

  const bindGesture = useCallback(
    (onMove: (e: MouseEvent) => void) => {
      const up = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', up);
        teardownRef.current = null;
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', up);
      teardownRef.current = up;
    },
    [],
  );

  const handleDrag = useCallback(
    (e: React.MouseEvent) => {
      onFocus?.();
      if (windowState.isMaximized) return;
      const offsetX = e.clientX - windowState.x;
      const offsetY = e.clientY - windowState.y;
      bindGesture((me) => patch({ x: me.clientX - offsetX, y: me.clientY - offsetY }));
    },
    [windowState.isMaximized, windowState.x, windowState.y, patch, bindGesture, onFocus],
  );

  const handleResize = useCallback(
    (dir: string) => (e: React.MouseEvent) => {
      e.stopPropagation();
      onFocus?.();
      const { x: sx, y: sy, width: sw, height: sh } = windowState;
      const mx = e.clientX;
      const my = e.clientY;

      bindGesture((me) => {
        const dx = me.clientX - mx;
        const dy = me.clientY - my;
        let nx = sx;
        let ny = sy;
        let nw = sw;
        let nh = sh;

        if (dir.includes('e')) nw = Math.max(minWidth, sw + dx);
        if (dir.includes('s')) nh = Math.max(minHeight, sh + dy);
        if (dir.includes('w')) {
          const candidate = sw - dx;
          nw = Math.max(minWidth, candidate);
          // Anchor the right edge: once the minimum is hit, x stops following
          // the cursor instead of dragging the window sideways.
          nx = candidate > minWidth ? sx + dx : sx + sw - minWidth;
        }
        if (dir.includes('n')) {
          const candidate = sh - dy;
          nh = Math.max(minHeight, candidate);
          ny = candidate > minHeight ? sy + dy : sy + sh - minHeight;
        }
        patch({ x: nx, y: ny, width: nw, height: nh });
      });
    },
    [windowState, minWidth, minHeight, patch, bindGesture, onFocus],
  );

  if (!show || windowState.isMinimized) return null;

  const style: React.CSSProperties = windowState.isMaximized
    ? { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: windowState.zIndex }
    : {
        position: 'absolute',
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex: windowState.zIndex,
      };

  return (
    <div
      style={style}
      onMouseDown={onFocus}
      className="flex flex-col bg-[#ececec] shadow-[4px_4px_16px_rgba(0,0,0,0.5)] border border-[#404040]/50 rounded-[2px] overflow-hidden select-none text-[11px]"
    >
      <div
        onMouseDown={handleDrag}
        className="h-[26px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default shrink-0 border-b border-gray-400"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {icon}
          <span className="text-black font-medium text-[11.5px] tracking-tight truncate">{title}</span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <div
            onClick={() => patch({ isMinimized: true })}
            className="w-5 h-5 flex items-center justify-center hover:bg-black/5 cursor-default"
          >
            <Minus className="w-3.5 h-3.5 text-gray-600" />
          </div>
          <div
            onClick={() => patch({ isMaximized: !windowState.isMaximized })}
            className="w-5 h-5 flex items-center justify-center hover:bg-black/5 cursor-default"
          >
            <Square className="w-3 h-3 text-gray-600" />
          </div>
          <div
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center hover:bg-red-600 group cursor-default"
          >
            <X className="w-3.5 h-3.5 text-gray-600 group-hover:text-white" />
          </div>
        </div>
      </div>

      <div className="h-[3px] shrink-0" style={{ background: accent }} />

      {toolbar && (
        <div className="flex items-center gap-1 px-2 py-1 bg-[#f0f0f0] border-b border-[#d4d0c8] shrink-0 flex-wrap">
          {toolbar}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">{children}</div>

      {footer && (
        <div className="px-3 py-1 bg-[#f0f0f0] border-t border-[#d4d0c8] text-[9.5px] text-gray-600 shrink-0 flex justify-between items-center">
          {footer}
        </div>
      )}

      {!windowState.isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className="absolute top-0 left-1 right-1 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('s')} className="absolute bottom-0 left-1 right-1 h-1 cursor-ns-resize z-[60]" />
          <div onMouseDown={handleResize('e')} className="absolute top-1 bottom-1 right-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('w')} className="absolute top-1 bottom-1 left-0 w-1 cursor-ew-resize z-[60]" />
          <div onMouseDown={handleResize('nw')} className="absolute top-0 left-0 w-2 h-2 cursor-nwse-resize z-[70]" />
          <div onMouseDown={handleResize('ne')} className="absolute top-0 right-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={handleResize('sw')} className="absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={handleResize('se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[70]" />
        </>
      )}
    </div>
  );
};

// ─── Toolbar pieces shared by the data-bound windows ──────────────────────────

export const ToolBtn: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }
> = ({ danger, className, children, ...rest }) => (
  <button
    {...rest}
    className={cn(
      'flex items-center gap-1 px-2 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white rounded-[1px] disabled:opacity-40 disabled:cursor-not-allowed',
      danger ? 'hover:bg-red-100' : 'hover:bg-[#ffed99]',
      className,
    )}
  >
    {children}
  </button>
);

/** New / Edit / Delete / Refresh, wired to a useCrudResource result. */
export const CrudToolbar: React.FC<{
  onNew: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  canEdit: boolean;
  canDelete: boolean;
  isFetching?: boolean;
  isBusy?: boolean;
  extra?: React.ReactNode;
}> = ({ onNew, onEdit, onDelete, onRefresh, canEdit, canDelete, isFetching, isBusy, extra }) => (
  <>
    <ToolBtn onClick={onNew} disabled={isBusy}>
      <Plus className="w-3 h-3" /> New
    </ToolBtn>
    <ToolBtn onClick={onEdit} disabled={!canEdit || isBusy}>
      Edit
    </ToolBtn>
    <ToolBtn onClick={onDelete} disabled={!canDelete || isBusy} danger>
      <Trash2 className="w-3 h-3" /> Delete
    </ToolBtn>
    <ToolBtn onClick={onRefresh} title="Refresh">
      <RefreshCw className={cn('w-3 h-3', isFetching && 'animate-spin')} />
    </ToolBtn>
    {extra}
  </>
);

/** Inline success / failure banner used in every data-bound window's toolbar. */
export const StatusNote: React.FC<{ error?: string; status?: string }> = ({ error, status }) => {
  if (error) {
    return (
      <span className="text-[10px] text-red-700 ml-2 flex items-center gap-1 max-w-[520px]">
        <AlertCircle className="w-3 h-3 shrink-0" />
        <span className="truncate" title={error}>{error}</span>
      </span>
    );
  }
  if (status) {
    return (
      <span className="text-[10px] text-green-700 ml-2 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> {status}
      </span>
    );
  }
  return null;
};

/** Consistent empty / loading / no-tenant messaging for list panes. */
export const ListPlaceholder: React.FC<{
  noCompany?: boolean;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyText?: string;
}> = ({ noCompany, isLoading, isEmpty, emptyText = 'No records yet. Click New to add one.' }) => {
  if (noCompany) {
    return (
      <div className="p-3 text-[10px] text-gray-500 italic">
        Sign in as a company user to load this data. Platform super admins have no company context.
      </div>
    );
  }
  if (isLoading) return <div className="p-3 text-[10.5px] text-gray-400">Loading…</div>;
  if (isEmpty) return <div className="p-3 text-[10.5px] text-gray-400">{emptyText}</div>;
  return null;
};

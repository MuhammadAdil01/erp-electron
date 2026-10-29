import * as RadixToast from '@radix-ui/react-toast';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { cn } from './cn';

// Short confirmations ("Password changed") that disappear on their own (Part 12 §12.5–12.6),
// announced to screen readers by Radix. The title is a node, so an app can pass one that
// translates itself.

type Toast = { id: number; title: ReactNode; tone: 'success' | 'error' | 'info' };

const ToastContext = createContext<(title: ReactNode, tone?: Toast['tone']) => void>(
  () => undefined,
);

const ICONS: Record<Toast['tone'], ReactNode> = {
  success: <CircleCheck aria-hidden className="size-5 text-success" />,
  error: <CircleAlert aria-hidden className="size-5 text-danger" />,
  info: <Info aria-hidden className="size-5 text-info" />,
};

export function ToastProvider({
  children,
  closeLabel,
}: {
  children: ReactNode;
  closeLabel: string;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((title: ReactNode, tone: Toast['tone'] = 'success') => {
    setToasts((list) => [...list, { id: Date.now() + Math.random(), title, tone }]);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      <RadixToast.Provider duration={5000}>
        {children}
        {toasts.map((toast) => (
          <RadixToast.Root
            key={toast.id}
            onOpenChange={(open) => {
              if (!open) setToasts((list) => list.filter((t) => t.id !== toast.id));
            }}
            className={cn(
              'flex w-[min(380px,calc(100vw-32px))] items-start gap-3 rounded-lg border bg-surface px-4 py-3 text-sm text-fg shadow-3',
              toast.tone === 'error' ? 'border-danger/40' : 'border-line',
            )}
          >
            <span className="mt-px shrink-0">{ICONS[toast.tone]}</span>
            <RadixToast.Title className="min-w-0 flex-1 font-medium">
              {toast.title}
            </RadixToast.Title>
            <RadixToast.Close
              aria-label={closeLabel}
              className="-me-1 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted hover:bg-subtle hover:text-fg"
            >
              <X aria-hidden className="size-4" />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed end-4 bottom-4 z-1000 m-0 flex list-none flex-col gap-2 p-0" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

/** show(title, tone): a toast inside ToastProvider. */
export function useToast() {
  return useContext(ToastContext);
}

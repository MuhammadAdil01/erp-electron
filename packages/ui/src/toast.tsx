import * as RadixToast from '@radix-ui/react-toast';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { color, radii, space } from './tokens';

// Short confirmations ("Password changed") that disappear on their own (Part 12 §12.6),
// announced to screen readers by Radix.

type Toast = { id: number; title: string; tone: 'success' | 'error' | 'info' };

const ToastContext = createContext<(title: string, tone?: Toast['tone']) => void>(() => undefined);

export function ToastProvider({
  children,
  closeLabel,
}: {
  children: ReactNode;
  closeLabel: string;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((title: string, tone: Toast['tone'] = 'success') => {
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
            style={{
              background: color('surface'),
              border: `1px solid ${toast.tone === 'error' ? color('danger') : color('border')}`,
              borderRadius: radii.md,
              padding: space(3),
              display: 'flex',
              gap: space(3),
              alignItems: 'center',
            }}
          >
            <RadixToast.Title>{toast.title}</RadixToast.Title>
            <RadixToast.Close
              aria-label={closeLabel}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ×
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport
          style={{
            position: 'fixed',
            bottom: space(4),
            insetInlineEnd: space(4),
            display: 'flex',
            flexDirection: 'column',
            gap: space(2),
            listStyle: 'none',
            margin: 0,
            padding: 0,
            zIndex: 1000,
          }}
        />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

/** show(title, tone): a toast inside ToastProvider. */
export function useToast() {
  return useContext(ToastContext);
}

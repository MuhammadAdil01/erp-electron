import { ApiError } from '@erp/sdk';
import { Banner, Button, Dialog, Input } from '@erp/ui';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { errorMessage, sdk } from './auth';

// Sensitive console actions need a fresh MFA check (Part 03 §3.3.1). Wrap an action in
// guard(): when the API answers step_up_required, a dialog asks for an authenticator code,
// confirms it, and runs the action again.

type Guard = <T>(action: () => Promise<T>) => Promise<T>;
const StepUpContext = createContext<Guard>((action) => action());

/** Runs the action; if the API asks for a fresh MFA check, asks for one and runs it once more. */
export async function withStepUp<T>(
  action: () => Promise<T>,
  ask: () => Promise<void>,
): Promise<T> {
  try {
    return await action();
  } catch (e) {
    if (!(e instanceof ApiError) || e.code !== 'step_up_required') throw e;
    await ask();
    return action();
  }
}

export function useStepUp(): Guard {
  return useContext(StepUpContext);
}

export function StepUpProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const pending = useRef<{ resolve: () => void; reject: (e: unknown) => void } | null>(null);

  const guard: Guard = useCallback(
    (action) =>
      withStepUp(
        action,
        () =>
          new Promise<void>((resolve, reject) => {
            pending.current = { resolve, reject };
            setCode('');
            setError(undefined);
            setOpen(true);
          }),
      ),
    [],
  );

  const confirm = async () => {
    try {
      await sdk.console.stepUp({ code: code.trim() });
      setOpen(false);
      pending.current?.resolve();
      pending.current = null;
    } catch (e) {
      setError(errorMessage(e, t));
    }
  };

  return (
    <StepUpContext.Provider value={guard}>
      {children}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            pending.current?.reject(new Error('step-up cancelled'));
            pending.current = null;
          }
          setOpen(next);
        }}
        title={t('console.stepup.title')}
        description={t('console.stepup.intro')}
        closeLabel={t('common.cancel')}
        footer={<Button onClick={() => void confirm()}>{t('console.stepup.confirm')}</Button>}
      >
        {error && <Banner tone="error">{error}</Banner>}
        <Input
          id="step-up-code"
          label={t('console.stepup.code')}
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void confirm();
          }}
        />
      </Dialog>
    </StepUpContext.Provider>
  );
}

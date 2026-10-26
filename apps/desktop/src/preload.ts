import { contextBridge, ipcRenderer } from 'electron';
import type { DeviceInfo } from './device-info';

// The only API the page gets from the desktop shell (§10.12.1). Sign-in goes through the main
// process, which keeps the refresh token; the page receives access tokens only.

type Answer =
  { ok: true; value: unknown } | { ok: false; error: { status: number; problem: unknown } };

const call = async (channel: string, ...args: unknown[]) => {
  const answer = (await ipcRenderer.invoke(channel, ...args)) as Answer;
  if (answer.ok) return answer.value;
  throw answer.error;
};

contextBridge.exposeInMainWorld('device', {
  info: (): Promise<DeviceInfo> => ipcRenderer.invoke('device:info'),
});

contextBridge.exposeInMainWorld('erp', {
  auth: {
    login: (email: string, password: string) => call('auth:login', email, password),
    verifyMfa: (input: { challenge: string; code?: string; recovery_code?: string }) =>
      call('auth:verify-mfa', input),
    refresh: () => call('auth:refresh'),
    logout: () => call('auth:logout'),
  },
});

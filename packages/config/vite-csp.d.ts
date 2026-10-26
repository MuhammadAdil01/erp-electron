import type { Plugin } from 'vite';

export function contentSecurityPolicy(options: { apiOrigin: string }): string;
export function cspPlugin(options: { apiOrigin: string }): Plugin;

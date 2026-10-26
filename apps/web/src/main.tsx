import { injectTokens, ToastProvider } from '@erp/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { auth } from './auth';
import { i18n } from './i18n';
import { router } from './router';
import './index.css';

injectTokens();
// Signed in again if the refresh cookie (or the desktop's stored token) is still good.
void auth().restore();

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider closeLabel={i18n.t('common.close')}>
          <RouterProvider router={router} />
        </ToastProvider>
      </QueryClientProvider>
    </I18nextProvider>
  </StrictMode>,
);

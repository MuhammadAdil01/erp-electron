import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min — don't re-fetch if data is fresh
      retry: 1,
      refetchOnWindowFocus: false,  // desktop app — no browser tab focus events
    },
    mutations: {
      retry: 0,
    },
  },
});

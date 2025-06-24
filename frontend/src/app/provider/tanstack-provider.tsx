"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface TanstackProviderProps {
  children: React.ReactNode;
}

export const TanstackProvider = ({ children }: TanstackProviderProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Optional: Prevents automatic retries
        staleTime: 1000 * 60 * 5, // Giữ cache trong 5 phút
        retryDelay: 2, // Thử lại 2 lần nếu request lỗi
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

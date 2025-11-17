"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "@/components/SessionProvider";
import { useState, lazy, Suspense } from "react";

// Lazy load non-critical components
const WhatsAppWidget = lazy(() => import("@/components/WhatsAppWidget"));
const ScrollToTop = lazy(() => import("@/components/ScrollToTop"));

const queryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(queryClientOptions));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <SessionProvider>
          <Suspense fallback={null}>
            <ScrollToTop />
          </Suspense>
          <Toaster />
          <Sonner />
          <Suspense fallback={null}>
            <WhatsAppWidget />
          </Suspense>
          {children}
        </SessionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

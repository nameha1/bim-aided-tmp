"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSessionManager } from "@/hooks/use-session-manager";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import ScrollToTop from "@/components/ScrollToTop";
import { useState } from "react";

const queryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
};

import { SessionProvider } from "@/components/SessionProvider";

// ... existing code ...

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(queryClientOptions));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SessionProvider>
          <ScrollToTop />
          <Toaster />
          <Sonner />
          <WhatsAppWidget />
          {children}
        </SessionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

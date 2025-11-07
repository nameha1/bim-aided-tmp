"use client";

import { useSessionManager } from "@/hooks/use-session-manager";
import { usePathname } from "next/navigation";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // useSessionManager now correctly uses hooks within the router's context
  useSessionManager();
  
  return <>{children}</>;
}

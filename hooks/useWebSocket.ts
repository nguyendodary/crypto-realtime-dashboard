"use client";

import { useEffect, useRef } from "react";
import { wsManager } from "@/lib/websocket";
import { useAppStore } from "@/lib/store";

export function useWebSocket() {
  const { wsConnected } = useAppStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && typeof window !== "undefined") {
      wsManager.connect();
      initialized.current = true;
    }

    return () => {};
  }, []);

  return { isConnected: wsConnected };
}

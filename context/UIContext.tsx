"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type UIContextType = {
  openAuth?: () => void;
  setOpenAuth?: (fn: () => void) => void;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [openAuthFn, setOpenAuthFn] = useState<() => void>(() => () => {});

  const setOpenAuth = useCallback((fn: () => void) => {
    setOpenAuthFn(() => fn);
  }, []);

  const openAuth = useCallback(() => {
    try {
      openAuthFn();
    } catch (e) {
      // noop
    }
  }, [openAuthFn]);

  return (
    <UIContext.Provider value={{ openAuth, setOpenAuth }}>{children}</UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}

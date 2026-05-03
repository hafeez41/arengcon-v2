"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ModalState =
  | { kind: "project"; slug: string }
  | { kind: "update"; slug: string }
  | { kind: "category"; slug: "arch" | "int" | "cons" }
  | { kind: "updates" }
  | null;

type ModalContextValue = {
  modal: ModalState;
  openProject: (slug: string) => void;
  openUpdate: (slug: string) => void;
  openCategory: (key: "arch" | "int" | "cons") => void;
  openUpdates: () => void;
  setSlug: (slug: string) => void;
  close: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalState>(null);

  const openProject = useCallback((slug: string) => {
    setModal({ kind: "project", slug });
  }, []);

  const openUpdate = useCallback((slug: string) => {
    setModal({ kind: "update", slug });
  }, []);

  const openCategory = useCallback((key: "arch" | "int" | "cons") => {
    setModal({ kind: "category", slug: key });
  }, []);

  const openUpdates = useCallback(() => {
    setModal({ kind: "updates" });
  }, []);

  const setSlug = useCallback((slug: string) => {
    setModal((prev) => {
      if (!prev) return prev;
      if (prev.kind === "project" || prev.kind === "update") {
        return { ...prev, slug };
      }
      return prev;
    });
  }, []);

  const close = useCallback(() => setModal(null), []);

  const value = useMemo(
    () => ({ modal, openProject, openUpdate, openCategory, openUpdates, setSlug, close }),
    [modal, openProject, openUpdate, openCategory, openUpdates, setSlug, close],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be inside ModalProvider");
  return ctx;
}

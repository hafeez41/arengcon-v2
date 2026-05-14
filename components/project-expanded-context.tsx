"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Ctx = {
  anyExpanded: boolean;
  setAnyExpanded: (v: boolean) => void;
  /** True when the currently expanded row's rect overlaps the side-rail viewport zone. */
  expandedOverlapsRail: boolean;
  setExpandedOverlapsRail: (v: boolean) => void;
};

const Context = createContext<Ctx>({
  anyExpanded: false,
  setAnyExpanded: () => {},
  expandedOverlapsRail: false,
  setExpandedOverlapsRail: () => {},
});

export function ProjectExpandedProvider({ children }: { children: ReactNode }) {
  const [anyExpanded, setAnyExpanded] = useState(false);
  const [expandedOverlapsRail, setExpandedOverlapsRail] = useState(false);
  return (
    <Context.Provider
      value={{ anyExpanded, setAnyExpanded, expandedOverlapsRail, setExpandedOverlapsRail }}
    >
      {children}
    </Context.Provider>
  );
}

export function useProjectExpanded() {
  return useContext(Context);
}

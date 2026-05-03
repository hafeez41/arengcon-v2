"use client";

import { createContext, useContext } from "react";

const IntroContext = createContext(false);

export function IntroProvider({
  done,
  children,
}: {
  done: boolean;
  children: React.ReactNode;
}) {
  return <IntroContext.Provider value={done}>{children}</IntroContext.Provider>;
}

export function useIntroDone() {
  return useContext(IntroContext);
}

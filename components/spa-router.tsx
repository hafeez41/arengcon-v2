"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Ctx = {
  path: string;
  navigate: (href: string) => void;
};

const RouterCtx = createContext<Ctx>({
  path: "/",
  navigate: () => {},
});

export function useRouterPath() {
  return useContext(RouterCtx).path;
}

export function useNavigate() {
  return useContext(RouterCtx).navigate;
}

export function SpaRouterProvider({
  initialPath,
  children,
}: {
  initialPath: string;
  children: React.ReactNode;
}) {
  const [path, setPath] = useState(initialPath);

  useEffect(() => {
    const onPop = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener("popstate", onPop);
    setPath(window.location.pathname);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((href: string) => {
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      window.location.href = href;
      return;
    }
    if (href === window.location.pathname) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.history.pushState({}, "", href);
    setPath(href);
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank") return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("http://") ||
        href.startsWith("https://")
      ) {
        return;
      }
      if (anchor.hasAttribute("data-spa-skip")) return;
      e.preventDefault();
      navigate(href);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [navigate]);

  return (
    <RouterCtx.Provider value={{ path, navigate }}>
      {children}
    </RouterCtx.Provider>
  );
}

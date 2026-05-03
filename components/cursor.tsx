"use client";

import { useEffect, useRef, useState } from "react";

export function Cursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [hasFinePointer, setHasFinePointer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setHasFinePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!hasFinePointer) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let raf = 0;

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX - 18}px, ${ringY - 18}px, 0)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (hidden) setHidden(false);
      const target = e.target as Element | null;
      const isHover =
        !!target?.closest(
          'a, button, [role="button"], [data-cursor="hover"], input, textarea, label',
        );
      setHover(isHover);
    };

    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [hasFinePointer, hidden]);

  if (!hasFinePointer) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-9 w-9 rounded-full border-[1.5px] border-white mix-blend-difference transition-[width,height,opacity,transform,border-width] duration-200 ease-out"
        style={{
          opacity: hidden ? 0 : 1,
          transform: "translate3d(-100px,-100px,0)",
          ...(hover
            ? { width: "52px", height: "52px", borderWidth: "2px" }
            : {}),
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference transition-opacity duration-150"
        style={{
          opacity: hidden ? 0 : hover ? 0 : 1,
          transform: "translate3d(-100px,-100px,0)",
        }}
      />
    </>
  );
}

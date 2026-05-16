"use client";

import { useRef, useState } from "react";

/**
 * Minimal native HTML5 drag-and-drop list reordering — no dependencies.
 *
 * Drag handlers live on the list CONTAINER (via `containerProps`) and use
 * event delegation, so the rows themselves only need `draggable` + a data
 * key. This avoids framer-motion's `motion.li` overriding onDragStart/
 * onDragEnd with its own pan-gesture types.
 *
 * Usage:
 *   const { containerProps, rowProps } = useDragReorder(items, getKey, onReorder)
 *   <ul {...containerProps}> {items.map(it => <motion.li {...rowProps(it)} />)} </ul>
 */
export function useDragReorder<T>(
  items: T[],
  getKey: (t: T) => string,
  onReorder: (next: T[]) => void,
) {
  const dragKey = useRef<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);

  const keyFromEvent = (e: React.DragEvent): string | null => {
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
      "[data-reorder-key]",
    );
    return el?.dataset.reorderKey ?? null;
  };

  const move = (fromKey: string, toKey: string) => {
    if (fromKey === toKey) return;
    const from = items.findIndex((x) => getKey(x) === fromKey);
    const to = items.findIndex((x) => getKey(x) === toKey);
    if (from < 0 || to < 0) return;
    const next = items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  };

  const containerProps = {
    onDragStart: (e: React.DragEvent) => {
      const k = keyFromEvent(e);
      if (!k) return;
      dragKey.current = k;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", k);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const k = keyFromEvent(e);
      if (k && k !== overKey) setOverKey(k);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const to = keyFromEvent(e);
      const from = dragKey.current;
      dragKey.current = null;
      setOverKey(null);
      if (from && to) move(from, to);
    },
    onDragEnd: () => {
      dragKey.current = null;
      setOverKey(null);
    },
  };

  const rowProps = (item: T) => {
    const key = getKey(item);
    return {
      draggable: true,
      "data-reorder-key": key,
      "data-drop-target": overKey === key ? "" : undefined,
    };
  };

  return { containerProps, rowProps };
}

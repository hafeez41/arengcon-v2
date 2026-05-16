"use client";

import { useRef, useState } from "react";

/**
 * Minimal native HTML5 drag-and-drop list reordering — no dependencies.
 * Spread `rowProps(item)` onto each list row. When a drop completes,
 * `onReorder` is called with the full reordered array.
 *
 * `overId` is exposed so the row can show a drop indicator.
 */
export function useDragReorder<T>(
  items: T[],
  getKey: (t: T) => string,
  onReorder: (next: T[]) => void,
) {
  const dragKey = useRef<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);

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

  const rowProps = (item: T) => {
    const key = getKey(item);
    return {
      draggable: true,
      "data-drop-target": overKey === key ? "" : undefined,
      onDragStart: (e: React.DragEvent) => {
        dragKey.current = key;
        e.dataTransfer.effectAllowed = "move";
        // Required for Firefox to initiate the drag.
        e.dataTransfer.setData("text/plain", key);
      },
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (overKey !== key) setOverKey(key);
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        const from = dragKey.current;
        dragKey.current = null;
        setOverKey(null);
        if (from) move(from, key);
      },
      onDragEnd: () => {
        dragKey.current = null;
        setOverKey(null);
      },
    };
  };

  return { rowProps, draggingKey: dragKey.current, overKey };
}

/** Moves the item `activeId` to the position of `overId` (drag and drop reorder). Unknown ids change nothing. */
export function moveById<T extends { id: string }>(items: T[], activeId: string, overId: string): T[] {
  const from = items.findIndex((i) => i.id === activeId);
  const to = items.findIndex((i) => i.id === overId);
  if (from < 0 || to < 0 || from === to) return items;
  const next = [...items];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}

/** Swaps the item `id` with its neighbour `delta` places away (layer forward/backward). At an end or unknown id, nothing changes. */
export function shiftById<T extends { id: string }>(items: T[], id: string, delta: 1 | -1): T[] {
  const from = items.findIndex((i) => i.id === id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= items.length) return items;
  const next = [...items];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

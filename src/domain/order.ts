/** Moves the item `activeId` to the position of `overId` (drag and drop reorder). Unknown ids change nothing. */
export function moveById<T extends { id: string }>(items: T[], activeId: string, overId: string): T[] {
  const from = items.findIndex((i) => i.id === activeId);
  const to = items.findIndex((i) => i.id === overId);
  if (from < 0 || to < 0 || from === to) return items;
  const next = [...items];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ListItem } from "@/lib/api";

interface Props {
  title: string;
  items: ListItem[] | null; // null = closed
  onPick: (id: string) => void;
  onClose: () => void;
}

/** Picker for a saved file in one of the storage folders. */
export function ListDialog({ title, items, onPick, onClose }: Props) {
  return (
    <Dialog open={items !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {items?.length === 0 && <p className="text-muted-foreground">Nothing saved yet.</p>}
        <ul className="flex flex-col gap-2">
          {items?.map((i) => (
            <li key={i.id}>
              <Button variant="outline" className="w-full justify-start" onClick={() => onPick(i.id)}>
                {i.name}
              </Button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

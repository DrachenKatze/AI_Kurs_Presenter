import { Button } from "@/components/ui/button";
import type { SlideElement, TextStyle } from "@/domain/types";

// Web-safe stacks, so slides look the same without loading fonts
const FONTS = ["Arial", "Verdana", "Trebuchet MS", "Georgia", "Times New Roman", "Courier New", "Impact"];

interface Props {
  element: SlideElement;
  onChange: (style: TextStyle) => void;
}

/** Colour, size, font, bold/italic and shadow/glow of a selected text or field element. */
export function TextStyleBar({ element, onChange }: Props) {
  const s: TextStyle = element.style ?? { fontSize: 24 };
  const set = (p: Partial<TextStyle>) => onChange({ ...s, ...p });
  const select = "h-7 rounded-lg border bg-background px-2 text-sm";

  return (
    <div aria-label="Text style" className="flex flex-wrap items-center gap-2 text-sm">
      <label className="flex items-center gap-1">
        Color
        <input type="color" value={s.color ?? "#000000"} onChange={(e) => set({ color: e.target.value })} />
      </label>
      <label className="flex items-center gap-1">
        Size
        <input
          type="number"
          min={4}
          max={200}
          className={`${select} w-16`}
          value={s.fontSize}
          onChange={(e) => e.target.value && set({ fontSize: Math.min(Math.max(Number(e.target.value), 4), 200) })}
        />
      </label>
      <label className="flex items-center gap-1">
        Font
        <select className={select} value={s.font ?? ""} onChange={(e) => set({ font: e.target.value || undefined })}>
          <option value="">Default</option>
          {FONTS.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f}
            </option>
          ))}
        </select>
      </label>
      <Button size="sm" variant={s.bold ? "default" : "outline"} aria-pressed={!!s.bold} onClick={() => set({ bold: !s.bold })}>
        <b>Bold</b>
      </Button>
      <Button size="sm" variant={s.italic ? "default" : "outline"} aria-pressed={!!s.italic} onClick={() => set({ italic: !s.italic })}>
        <i>Italic</i>
      </Button>
      <label className="flex items-center gap-1">
        Effect
        <select
          className={select}
          value={s.effect ?? ""}
          onChange={(e) => set({ effect: (e.target.value || undefined) as TextStyle["effect"] })}
        >
          <option value="">None</option>
          <option value="shadow">Shadow</option>
          <option value="glow">Glow</option>
        </select>
      </label>
      {s.effect && (
        <label className="flex items-center gap-1">
          Effect color
          <input type="color" value={s.effectColor ?? "#888888"} onChange={(e) => set({ effectColor: e.target.value })} />
        </label>
      )}
    </div>
  );
}

import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import type { Background, SlideElement, TextStyle } from "@/domain/types";
import { cn } from "@/lib/utils";

interface Props extends ComponentProps<"div"> {
  elements: SlideElement[];
  background?: Background;
  /** Extra props per element wrapper (used by the editor for selection and dragging). */
  elementProps?: (e: SlideElement) => HTMLAttributes<HTMLDivElement>;
  /** Extra content per element, outside its clipped area (resize handle, warnings). */
  overlay?: (e: SlideElement) => ReactNode;
}

function backgroundCss(bg?: Background) {
  if (bg?.kind === "color") return bg.color;
  if (bg?.kind === "gradient") return `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`;
  if (bg?.kind === "image" && bg.src) return `center / cover no-repeat url("${bg.src}")`;
  return undefined;
}

// In cqw like the font size, so effects scale with the slide
function textShadow(s?: TextStyle) {
  const c = s?.effectColor ?? "#888888";
  if (s?.effect === "shadow") return `0.2cqw 0.2cqw 0.3cqw ${c}`;
  if (s?.effect === "glow") return `0 0 0.5cqw ${c}, 0 0 1cqw ${c}`;
  return undefined;
}

/** Draws elements in percent on a 16:9 box. Shared by thumbnails, the editors and the fullscreen runner. */
export function SlideRenderer({ elements, background, elementProps, overlay, className, style, ...rest }: Props) {
  return (
    // container-type lets font sizes scale with the slide width (cqw), so every size looks the same
    <div className={cn("relative aspect-video w-full overflow-hidden bg-white text-black [container-type:inline-size]", className)}
      style={{ background: backgroundCss(background), ...style }}
      {...rest}
    >
      {elements.map((e) => {
        const extra = elementProps?.(e) ?? {};
        const s = e.style;
        return (
          <div
            key={e.id}
            {...extra}
            className={cn("absolute", extra.className)}
            style={{
              left: `${e.x}%`,
              top: `${e.y}%`,
              width: `${e.w}%`,
              height: `${e.h}%`,
              transform: e.rotation ? `rotate(${e.rotation}deg)` : undefined,
              ...extra.style,
            }}
          >
            <div
              className="h-full w-full overflow-hidden"
              style={{
                fontSize: `${(s?.fontSize ?? 24) / 10}cqw`,
                fontWeight: s?.bold ? 700 : 400,
                fontStyle: s?.italic ? "italic" : undefined,
                fontFamily: s?.font,
                color: s?.color,
                textShadow: textShadow(s),
                textAlign: s?.align ?? "left",
              }}
            >
              {e.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element -- data URLs, nothing for next/image to optimise
                <img src={e.src} alt="" className="h-full w-full object-contain" draggable={false} />
              ) : (
                (e.text ?? `[${e.columnName ?? ""}]`)
              )}
            </div>
            {overlay?.(e)}
          </div>
        );
      })}
    </div>
  );
}

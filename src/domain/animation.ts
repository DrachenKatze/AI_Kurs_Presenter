import type { CSSProperties } from "react";
import type { Animation } from "./types";

export const ANIMATIONS = [
  { key: "shake", label: "Shake", amount: "angle", unit: "°", initial: { angle: 10, speed: 0.5 } },
  { key: "jump", label: "Jump", amount: "height", unit: "% of slide height", initial: { height: 5, speed: 1 } },
  { key: "pulse", label: "Grow and shrink", amount: "size", unit: "%", initial: { size: 10, speed: 1 } },
] as const;

/**
 * CSS for an element's animations (keyframes el-* in globals.css). Each one moves its own transform property
 * (rotate, translate, scale), so all three can run at once without overriding each other or the element's rotation.
 */
export function animationCss(a?: Animation): CSSProperties | undefined {
  if (!a) return undefined;
  const parts = [
    a.shake && `el-shake ${a.shake.speed}s ease-in-out infinite`,
    a.jump && `el-jump ${a.jump.speed}s ease-in-out infinite`,
    a.pulse && `el-pulse ${a.pulse.speed}s ease-in-out infinite`,
  ].filter(Boolean);
  if (parts.length === 0) return undefined;
  return {
    animation: parts.join(", "),
    "--shake": `${a.shake?.angle ?? 0}deg`,
    "--jump": `${((a.jump?.height ?? 0) * 9) / 16}cqw`, // slide height = 9/16 of the width the cqw unit measures
    "--pulse": `${(a.pulse?.size ?? 0) / 100}`,
  } as CSSProperties;
}

/** How a slide comes in when the runner moves to it. */
export const TRANSITIONS = [
  { id: "none", label: "Standard" },
  { id: "fade", label: "Fade out" },
  { id: "explode", label: "Explode in pieces" },
  { id: "turn", label: "Turn the page" },
] as const;

export type Transition = (typeof TRANSITIONS)[number]["id"];

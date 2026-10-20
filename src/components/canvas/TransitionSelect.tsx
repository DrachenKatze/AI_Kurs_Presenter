import { TRANSITIONS, type Transition } from "@/domain/transition";

interface Props {
  value?: Transition;
  /** Shown instead of a value when slides use different effects. */
  mixed?: boolean;
  onChange: (t: Transition) => void;
}

/** "Page effect" dropdown: how a slide comes in during the presentation. */
export function TransitionSelect({ value, mixed, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm">
      Page effect
      <select
        className="h-8 rounded-lg border bg-background px-2"
        value={mixed ? "" : (value ?? "none")}
        onChange={(e) => onChange(e.target.value as Transition)}
      >
        {mixed && (
          <option value="" disabled>
            Mixed
          </option>
        )}
        {TRANSITIONS.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  );
}

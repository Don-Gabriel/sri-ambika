"use client";

export default function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: () => void;
  label?: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label ?? "Toggle"}
      onClick={onChange}
      className={`relative flex h-9 w-16 shrink-0 items-center rounded-full px-1 transition-colors duration-300 ${
        on ? "bg-leaf/30" : "neu-inset"
      }`}
    >
      <span
        className={`grid h-7 w-7 place-items-center rounded-full transition-transform duration-300 ${
          on ? "translate-x-7 clay-gold" : "translate-x-0 neu"
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${on ? "bg-espresso-900" : "bg-ivory/40"}`} />
      </span>
    </button>
  );
}

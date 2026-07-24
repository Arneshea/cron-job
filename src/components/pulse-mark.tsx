export function PulseMark({ className = "", animate = false }: { className?: string; animate?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0 16 H32 L40 4 L48 28 L56 16 H68 L76 8 L84 24 L92 16 H120"
        stroke="var(--signal-amber)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? "pulse-sweep" : ""}
      />
    </svg>
  );
}

export function SectionRule({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-3 w-full max-w-md ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <line x1="0" y1="9.5" x2="600" y2="9.5" className="stroke-border" strokeWidth="1" />
      <path
        d="M300 6 L303.5 9.5 L300 13 L296.5 9.5 Z"
        className="fill-accent"
      />
    </svg>
  );
}
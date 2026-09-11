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
      <line x1="0" y1="9" x2="600" y2="9" className="stroke-support" strokeWidth="1" />
      {[60, 150, 240, 360, 450, 540].map((cx) => (
        <g key={cx}>
          <line x1={cx} y1="9" x2={cx - 6} y2="3" className="stroke-support" strokeWidth="1" />
          <line x1={cx} y1="9" x2={cx + 6} y2="3" className="stroke-support" strokeWidth="1" />
          <line x1={cx} y1="9" x2={cx} y2="2" className="stroke-support" strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
}

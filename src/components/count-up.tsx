'use client';

import { useEffect, useRef, useState } from 'react';

function parseValue(raw: string): { prefix: string; target: number; decimals: number; suffix: string } | null {
  const match = raw.match(/^([^0-9]*)([\d.,]+)(.*)$/);
  if (!match) return null;
  const [, prefix, numeric, suffix] = match;
  const normalized = numeric.replace(/,/g, '');
  const target = Number(normalized);
  if (!Number.isFinite(target)) return null;
  return {
    prefix,
    target,
    decimals: normalized.includes('.') ? normalized.split('.')[1].length : 0,
    suffix,
  };
}

export function CountUp({ value, className = '' }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const parsed = parseValue(value);
    const node = ref.current;
    if (!parsed || !node || parsed.target === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const { prefix, target, decimals, suffix } = parsed;
    const duration = 900;
    let start: number | null = null;
    let raf = 0;

    const frame = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      setDisplay(
        `${prefix}${current.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}${suffix}`
      );
      if (progress < 1) raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

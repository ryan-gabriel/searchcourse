'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    node.style.setProperty('--reveal-delay', `${delay}ms`);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} data-reveal="" className={className}>
      {children}
    </div>
  );
}

export function revealDelay(index: number, step = 60): Partial<CSSProperties> {
  return { ['--reveal-delay' as string]: `${index * step}ms` };
}

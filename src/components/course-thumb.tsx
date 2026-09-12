import Image from 'next/image';

const ALLOWED_HOSTS = new Set(['img-c.udemycdn.com', 'd3njjcbhbojbot.cloudfront.net']);

function isAllowedImage(src: string): boolean {
  try {
    return ALLOWED_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

export function CourseThumb({
  src,
  alt = '',
  sizes,
  priority = false,
}: {
  src: string | null;
  alt?: string;
  sizes: string;
  priority?: boolean;
}) {
  if (!src || !isAllowedImage(src)) {
    return (
      <div
        className="flex h-full w-full items-center justify-center bg-muted"
        aria-hidden="true"
      >
        <span className="text-3xl font-bold text-muted-foreground/40">SC</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
    />
  );
}
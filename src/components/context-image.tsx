import Image from 'next/image';

const UNSPLASH_HOST = 'images.unsplash.com';

function isAllowedImage(src: string): boolean {
  try {
    return new URL(src).hostname === UNSPLASH_HOST;
  } catch {
    return false;
  }
}

export function ContextImage({
  src,
  alt,
  className = '',
  sizes,
  priority = false,
  fallbackClassName = '',
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackClassName?: string;
}) {
  if (!src || !isAllowedImage(src)) {
    return (
      <div
        className={`bg-muted ${fallbackClassName || className}`}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? '100vw'}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}

// Curated Unsplash photos per category, keyed by category name. Photos depict
// the subject being studied (design workspace, code editor, camera gear, etc).
// Categories not in the map fall back to the generic study image.
const CATEGORY_IMAGES: Record<string, string> = {
  development: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1200&auto=format&fit=crop',
  'web development': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
  'data science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
  design: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1200&auto=format&fit=crop',
  'graphic design': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1200&auto=format&fit=crop',
  marketing: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=1200&auto=format&fit=crop',
  business: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop',
  finance: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop',
  photography: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1200&auto=format&fit=crop',
  music: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
  'personal development': 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1200&auto=format&fit=crop',
  health: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop',
};

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop';

export function imageForCategory(name: string): string {
  return CATEGORY_IMAGES[name.toLowerCase()] ?? FALLBACK_IMAGE;
}

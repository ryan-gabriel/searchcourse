export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatPercent(amount: number): string {
  const rounded = Math.round(amount);
  return `${rounded}%`;
}

export function discountPercent(originalPrice: number, finalPrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round((1 - finalPrice / originalPrice) * 100);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatStudents(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`;
  }
  return String(count);
}

export function formatCount(count: number): string {
  return count.toLocaleString('en-US');
}

export const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  ALL_LEVELS: 'All levels',
};
export function formatPriceSimple(price: number): string {
  return price === 0 ? 'FREE' : `$${price.toFixed(2)}`;
}

export async function hashIP(ip: string): Promise<string> {
  const salt = process.env.IP_SALT || "search-course-salt";
  const data = new TextEncoder().encode(ip + salt);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
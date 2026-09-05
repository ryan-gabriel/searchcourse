import type { NextConfig } from "next";

// NOTE (compatibility debt): 'unsafe-inline'/'unsafe-eval' in script-src are
// required for Next.js's inline hydration scripts and dev HMR. These should be
// replaced with nonce/hash-based CSP (next.config headers + middleware) and a
// documented removal plan before tightening to `'self'`.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co https://*.rapidapi.com",
      "form-action 'self'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img-c.udemycdn.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "d3njjcbhbojbot.cloudfront.net", port: "", pathname: "/**" },
    ],
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: securityHeaders,
    },
  ],
};

export default nextConfig;

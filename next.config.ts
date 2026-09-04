import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img-c.udemycdn.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "d3njjcbhbojbot.cloudfront.net", port: "", pathname: "/**" },
    ],
  },
};

export default nextConfig;

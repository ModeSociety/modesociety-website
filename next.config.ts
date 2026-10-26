import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Old Squarespace addresses keep their Google ranking by pointing at the new pages.
  async redirects() {
    return [
      { source: "/contact", destination: "/get-in-touch", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      { source: "/contact-us", destination: "/get-in-touch", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/for-brands", destination: "/work-with-us", permanent: true },
      { source: "/for-talent", destination: "/apply-to-be-a-creator", permanent: true },
      { source: "/apply", destination: "/apply-to-be-a-creator", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // photos dropped into the Drive media folders are served from here
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
    minimumCacheTTL: 2678400, // 31 days
  },
  // the share-image route reads its fonts from disk
  outputFileTracingIncludes: { "/og": ["./src/assets/fonts/**"] },
};

export default nextConfig;

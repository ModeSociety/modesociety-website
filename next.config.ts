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
  // the share-image route reads its fonts from disk
  outputFileTracingIncludes: { "/og": ["./src/assets/fonts/**"] },
};

export default nextConfig;

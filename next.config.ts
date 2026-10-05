import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // There's no separate contact page any more: everything goes to Get in touch.
  async redirects() {
    return [{ source: "/contact", destination: "/get-in-touch", permanent: true }];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "console.emcvietnam.vn",
        port: "9000",
        pathname: "*",
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "ricmvkntmvhlthwwrjdy.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**", // Adjust this if your path structure differs
      },
    ],
  },
};

export default nextConfig;
